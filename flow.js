'use strict';
// =====================================================================
// FLOW — micro-rondas tipo Duolingo, 100 % en inglés y offline.
// Cada ronda: 12 tarjetas (~4 min). Lo que fallas vuelve al final.
// =====================================================================
const FLOW_KEY = 'en_flow';
const FLOW_ROUND = 12;
const FLOW_GOAL = 100; // XP diaria

const FLOW_PRAISE = ['Nice!', 'Great!', 'Spot on!', 'Exactly!', 'Well done!', 'Nailed it!', 'Perfect!', "That's it!"];
const FLOW_OOPS = ['Not quite.', 'Almost!', 'Close one.', 'Not this time.'];

const flowRnd = Math.random;
const pick = a => a[Math.floor(flowRnd() * a.length)];
const flowShuffle = a => shuffle(a, flowRnd);
const wordsOf = s => plain(s).replace(/[.,!?;:"]/g, '').split(/\s+/).filter(Boolean);
const normSent = s => wordsOf(s).join(' ').toLowerCase().replace(/’/g, "'");

function getFlow() { const f = store.get(FLOW_KEY, {}); return { xp: f.xp || {}, total: f.total || 0, best: f.best || 0, rounds: f.rounds || 0, seen: f.seen || {} }; }
function saveFlow(f) { store.set(FLOW_KEY, f); }
function flowXpToday() { return getFlow().xp[todayKey()] || 0; }
function hasVoice() { return 'speechSynthesis' in window && speechSynthesis.getVoices().some(v => v.lang.startsWith('en')); }

// ---------- Generadores ----------
function allVocab() { return UNITS.flatMap(u => u.vocab.map(v => ({ ...v, unit: u.id }))); }
function allLines() {
  const out = [];
  UNITS.forEach(u => {
    (u.shadowing || []).forEach(s => out.push(s));
    (u.listening?.lines || []).forEach(([, t]) => { if (t.length < 110) out.push(t); });
  });
  return out;
}
function opts4(correct, pool) {
  const others = flowShuffle(pool.filter(x => x !== correct)).slice(0, 3);
  const o = flowShuffle([correct, ...others]);
  return { o, a: o.indexOf(correct) };
}

const GEN = {
  meaning() { // definición → palabra
    const V = allVocab(), v = pick(V);
    return { type: 'choice', id: `m_${v.w}`, kicker: '🧠 Which word fits?', prompt: `<div class="fl-def">${esc(v.def)}</div>`, ...opts4(v.w, V.map(x => x.w)), say: v.w, explain: v.ex };
  },
  context() { // hueco en el ejemplo
    const V = allVocab().filter(v => v.ex.toLowerCase().includes(v.w.toLowerCase().split(' ')[0]));
    const v = pick(V);
    const re = new RegExp(v.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*', 'i');
    const m = v.ex.match(re);
    if (!m) return GEN.meaning();
    const gap = v.ex.replace(re, '_____');
    const correct = m[0];
    return { type: 'choice', id: `c_${v.w}`, kicker: '🧩 Complete it', prompt: `<div class="fl-sent">${esc(gap)}</div>`, ...opts4(correct, V.map(x => x.w)), say: v.ex };
  },
  guess() {
    const g = pick(FLOW_GUESS), word = g.s.match(/\*([^*]+)\*/)[1];
    const o = flowShuffle(g.o);
    return { type: 'choice', id: `g_${word}`, kicker: '🔍 Guess from context', prompt: `<div class="fl-sent">${fmt(g.s)}</div><div class="fl-q">What does <strong>${esc(word)}</strong> probably mean?</div>`, o, a: o.indexOf(g.o[g.a]), say: plain(g.s) };
  },
  read() {
    const s = pick(FLOW_STORIES), o = flowShuffle(s.o);
    return { type: 'choice', id: `r_${s.t.slice(0, 20)}`, kicker: '📖 Read & get the idea', prompt: `<div class="fl-story">${esc(s.t)}</div><div class="fl-q">${esc(s.q)}</div>`, o, a: o.indexOf(s.o[s.a]), small: true, audio: s.t };
  },
  odd() {
    const d = pick(FLOW_ODD), o = flowShuffle(d.o);
    return { type: 'choice', id: `o_${d.o.join()}`, kicker: '🎯 Odd one out', prompt: `<div class="fl-q">Which one doesn't belong?</div>`, o, a: o.indexOf(d.o[d.a]), explain: d.why };
  },
  build() {
    const s = flowRnd() < 0.6 ? pick(FLOW_BUILD) : pick(allLines().filter(l => wordsOf(l).length <= 12));
    return { type: 'build', id: `b_${s}`, kicker: '🧱 Build the sentence', prompt: `<div class="fl-q">Put the words in order. Think in English order.</div>`, target: s };
  },
  listen() {
    const lines = allLines().concat(FLOW_BUILD).filter(l => wordsOf(l).length <= 13);
    const s = pick(lines);
    if (flowRnd() < 0.5) return { type: 'build', id: `lb_${s}`, kicker: '🎧 Write what you hear', prompt: `<div class="fl-q">Listen and build it.</div>`, target: s, listen: true };
    const { o, a } = opts4(s, lines);
    return { type: 'choice', id: `lc_${s}`, kicker: '🎧 What did you hear?', prompt: `<div class="fl-q">Listen. Which sentence is it?</div>`, o, a, listen: s, small: true };
  },
  taboo() {
    const t = pick(FLOW_TABOO);
    return { type: 'think', id: `t_${t.w}`, kicker: '💭 Explain it — no translating', prompt: `<div class="fl-big">${esc(t.w)}</div><div class="fl-q">Describe it out loud or in your head.<br>Forbidden words: ${t.ban.map(b => `<span class="fl-ban">${esc(b)}</span>`).join(' ')}</div>`, secs: 30 };
  },
  think() {
    const t = pick(FLOW_THINK);
    return { type: 'think', id: `k_${t.slice(0, 20)}`, kicker: '💭 Think in English', prompt: `<div class="fl-sent">${esc(t)}</div><div class="fl-q muted">No Spanish in your head. Missing a word? Describe it.</div>`, secs: 45 };
  },
  flip() {
    const cats = ['col', 'pv', 'link', 'work', 'gram', 'err'];
    const c = pick(DECK.filter(d => cats.includes(d.cat)));
    return { type: 'flip', id: `f_${c.id}`, kicker: `${CATEGORIES.find(x => x.id === c.cat)?.icon || '🃏'} ${Q[c.cat] || 'Do you know it?'}`, prompt: `<div class="fl-sent">${fmt(c.front)}</div>`, back: c.back, note: c.note };
  },
};

const FLOW_MIX = ['meaning', 'context', 'guess', 'read', 'build', 'listen', 'odd', 'taboo', 'meaning', 'guess', 'build', 'flip', 'context', 'read', 'think', 'listen'];

function buildRound() {
  const voice = hasVoice();
  const seen = getFlow().seen, used = new Set(), out = [];
  let mix = flowShuffle(FLOW_MIX).filter(t => voice || t !== 'listen');
  let tries = 0;
  while (out.length < FLOW_ROUND && tries++ < 200) {
    const type = mix[out.length % mix.length];
    const it = GEN[type]();
    if (used.has(it.id)) continue;
    if (seen[it.id] && seen[it.id] >= 3 && tries < 120) continue; // prioriza lo que has visto poco
    used.add(it.id); out.push(it);
  }
  // arranca con algo rápido (no con un "think" ni una lectura)
  const first = out.findIndex(x => x.type === 'choice' && !x.small);
  if (first > 0) out.unshift(out.splice(first, 1)[0]);
  return out;
}

// ---------- Player ----------
let F = null;

function openFlow() {
  stopSpeech();
  F = { items: buildRound(), i: 0, xp: 0, combo: 0, bestCombo: 0, ok: 0, done: 0, retry: new Set(), start: Date.now(), answered: false };
  $('flow').hidden = false;
  document.body.classList.add('no-scroll');
  renderFlow();
}
function closeFlow() {
  if (!F) return;
  stopSpeech();
  logFlowTime();
  $('flow').hidden = true;
  document.body.classList.remove('no-scroll');
  F = null;
  renderAll();
}
function logFlowTime() {
  if (!F || F.logged) return;
  const mins = Math.round((Date.now() - F.start) / 60000);
  if (F.done > 0) {
    const t = todayKey(), d = getDay(t);
    d.study += Math.max(1, Math.min(mins, 30));
    saveDay(t, d);
    const f = getFlow();
    f.xp[t] = (f.xp[t] || 0) + F.xp; f.total += F.xp; f.best = Math.max(f.best, F.bestCombo);
    saveFlow(f);
  }
  F.logged = true;
}

function flowProgress() {
  const pct = Math.round((F.i / F.items.length) * 100);
  $('flowBar').style.width = pct + '%';
  $('flowCombo').textContent = F.combo >= 2 ? `🔥 ${F.combo}` : '';
  $('flowXp').textContent = `${flowXpToday() + F.xp} XP`;
}

function renderFlow() {
  flowProgress();
  hideFeedback();
  if (F.i >= F.items.length) return renderFlowEnd();
  const it = F.items[F.i];
  F.answered = false;
  const body = $('flowBody');
  let html = `<div class="fl-kicker">${it.kicker}</div><div class="fl-prompt">${it.prompt}</div>`;
  if (it.listen) html += `<div class="fl-audio"><button type="button" class="fl-play" id="flPlay">🔊</button><button type="button" class="fl-play slow" id="flSlow">🐢</button></div>`;
  if (it.audio) html += `<button type="button" class="link-btn" id="flRead">🔊 Listen to it</button>`;

  if (it.type === 'choice') {
    html += `<div class="fl-opts${it.small ? ' small' : ''}">${it.o.map((o, i) => `<button type="button" class="fl-opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`;
    body.innerHTML = html;
    body.querySelectorAll('.fl-opt').forEach(b => b.onclick = () => {
      if (F.answered) return;
      const i = +b.dataset.i, ok = i === it.a;
      b.classList.add(ok ? 'right' : 'wrong');
      body.querySelectorAll('.fl-opt')[it.a].classList.add('right');
      body.querySelectorAll('.fl-opt').forEach(x => x.disabled = true);
      answer(ok, ok ? it.explain : `${it.o[it.a]}${it.explain ? ' — ' + it.explain : ''}`, it.say);
    });
  } else if (it.type === 'build') {
    const words = wordsOf(it.target);
    const tiles = flowShuffle(words.map((w, i) => ({ w, i })));
    html += `<div class="fl-line" id="flLine"></div><div class="fl-tiles" id="flTiles">${tiles.map(t => `<button type="button" class="fl-tile" data-i="${t.i}">${esc(t.w)}</button>`).join('')}</div>`;
    body.innerHTML = html;
    const placed = [];
    const line = $('flLine');
    const sync = () => { setFlowBtn('Check', placed.length ? check : null); };
    body.querySelectorAll('#flTiles .fl-tile').forEach(b => b.onclick = () => {
      if (F.answered || b.classList.contains('used')) return;
      b.classList.add('used');
      const chip = document.createElement('button');
      chip.type = 'button'; chip.className = 'fl-tile in'; chip.textContent = b.textContent;
      chip.onclick = () => { if (F.answered) return; chip.remove(); b.classList.remove('used'); placed.splice(placed.indexOf(b.textContent), 1); sync(); };
      line.appendChild(chip); placed.push(b.textContent); sync();
    });
    const check = () => {
      const said = [...line.children].map(c => c.textContent).join(' ');
      const ok = normSent(said) === normSent(it.target);
      line.classList.add(ok ? 'right' : 'wrong');
      answer(ok, ok ? '' : it.target, it.target);
    };
    sync();
  } else if (it.type === 'think') {
    html += `<div class="fl-timer" id="flTimer">${it.secs}s</div>`;
    body.innerHTML = html;
    let left = it.secs;
    F.timer = setInterval(() => {
      left--; const el = $('flTimer'); if (!el) return clearInterval(F.timer);
      el.textContent = left > 0 ? `${left}s` : 'Time! ✓';
      if (left <= 0) { clearInterval(F.timer); if (navigator.vibrate) navigator.vibrate(150); }
    }, 1000);
    setFlowBtn("Done — I said it", () => { clearInterval(F.timer); answer(true, 'Every time you describe instead of translating, your brain rewires a little.', null, 5); });
  } else if (it.type === 'flip') {
    html += `<div class="fl-back" id="flBack" hidden><div class="fl-sent">${fmt(it.back)}</div>${it.note ? `<div class="fl-q muted">${fmt(it.note)}</div>` : ''}</div>`;
    body.innerHTML = html;
    setFlowBtn('Show answer', () => {
      $('flBack').hidden = false;
      $('flowFoot').innerHTML = `<button type="button" class="btn fl-no" id="flNo">I didn't know it</button><button type="button" class="btn primary" id="flYes">I knew it</button>`;
      $('flNo').onclick = () => answer(false, '', null);
      $('flYes').onclick = () => answer(true, '', null);
    });
  }
  if (it.type === 'choice') setFlowBtn(null);

  if (it.listen) {
    const txt = typeof it.listen === 'string' ? it.listen : it.target;
    $('flPlay').onclick = () => speak(txt);
    $('flSlow').onclick = () => speak(txt, { rate: 0.7 });
    setTimeout(() => { if (F && F.items[F.i] === it) speak(txt); }, 300);
  }
  if (it.audio) $('flRead').onclick = () => speak(it.audio);
}

function setFlowBtn(label, handler) {
  const foot = $('flowFoot');
  if (!label) { foot.innerHTML = ''; return; }
  foot.innerHTML = `<button type="button" class="btn primary big" id="flBtn">${esc(label)}</button>`;
  $('flBtn').disabled = !handler;
  if (handler) $('flBtn').onclick = handler;
}

function answer(ok, explain, say, xp = 10) {
  if (F.answered) return;
  F.answered = true;
  const it = F.items[F.i];
  const firstTry = !F.retry.has(it.id);
  if (firstTry) { F.done++; if (ok) F.ok++; }
  const f = getFlow(); f.seen[it.id] = (f.seen[it.id] || 0) + 1; saveFlow(f);
  if (ok) {
    F.combo++; F.bestCombo = Math.max(F.bestCombo, F.combo);
    F.xp += firstTry ? xp + (F.combo >= 5 ? 5 : 0) : Math.round(xp / 2);
  } else {
    F.combo = 0;
    if (firstTry) { F.retry.add(it.id); F.items.push(regen(it)); }
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  }
  flowProgress();
  if (say && ok) speak(say, { rate: 1 });
  const fb = $('flowFeedback');
  fb.className = `fl-feedback show ${ok ? 'ok' : 'ko'}`;
  fb.innerHTML = `<div class="wrap"><div class="fl-fb-title">${ok ? (it.type === 'think' ? 'Good thinking! 💭' : pick(FLOW_PRAISE)) : pick(FLOW_OOPS)}</div>
    ${explain ? `<div class="fl-fb-text">${ok ? '' : 'Answer: '}${fmt(explain)}</div>` : ''}
    ${!ok ? '<div class="fl-fb-text muted">It will come back at the end.</div>' : ''}
    <button type="button" class="btn big ${ok ? 'fl-go' : 'fl-go ko'}" id="flNext">Continue</button></div>`;
  $('flowFoot').innerHTML = '';
  $('flNext').onclick = () => { stopSpeech(); F.i++; renderFlow(); };
  $('flNext').focus();
}
function regen(it) {
  // mismo contenido, otra presentación (opciones barajadas)
  const c = { ...it };
  if (c.type === 'choice') { const correct = c.o[c.a]; c.o = flowShuffle(c.o); c.a = c.o.indexOf(correct); }
  c.kicker = '🔁 ' + c.kicker.replace(/^🔁 /, '');
  return c;
}
function hideFeedback() { const fb = $('flowFeedback'); fb.className = 'fl-feedback'; fb.innerHTML = ''; }

function renderFlowEnd() {
  logFlowTime();
  const f = getFlow(); f.rounds++; saveFlow(f);
  const acc = F.done ? Math.round((F.ok / F.done) * 100) : 0;
  const today = flowXpToday(), goalPct = Math.min(100, Math.round((today / FLOW_GOAL) * 100));
  const mins = Math.max(1, Math.round((Date.now() - F.start) / 60000));
  $('flowBar').style.width = '100%';
  $('flowBody').innerHTML = `<div class="fl-end">
    <div class="fl-end-emoji">${acc >= 90 ? '🏆' : acc >= 70 ? '🎉' : '💪'}</div>
    <div class="fl-end-title">${acc >= 90 ? 'Outstanding!' : acc >= 70 ? 'Round complete!' : 'Good effort — keep going!'}</div>
    <div class="fl-end-stats">
      <div><b>+${F.xp}</b><span>XP</span></div>
      <div><b>${acc}%</b><span>accuracy</span></div>
      <div><b>${F.bestCombo}</b><span>best combo</span></div>
      <div><b>${mins}′</b><span>time</span></div>
    </div>
    <div class="fl-goal"><div class="fl-goal-bar"><div style="width:${goalPct}%"></div></div>
      <div class="small muted">Today: ${today} / ${FLOW_GOAL} XP ${today >= FLOW_GOAL ? '· Goal reached ✅' : ''}</div></div>
  </div>`;
  $('flowFoot').innerHTML = `<button type="button" class="btn" id="flStop">I'm done</button><button type="button" class="btn primary big" id="flAgain">One more round ⚡</button>`;
  $('flStop').onclick = closeFlow;
  $('flAgain').onclick = () => { closeFlow(); openFlow(); };
}

$('flowClose').onclick = closeFlow;
document.addEventListener('keydown', e => {
  if (!F) return;
  if (e.key === 'Escape') closeFlow();
  else if (e.key === 'Enter') { const b = $('flNext') || $('flBtn') || $('flAgain'); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
  else if (/^[1-4]$/.test(e.key) && !F.answered) { const b = document.querySelectorAll('.fl-opt')[+e.key - 1]; if (b) b.click(); }
});

// ---------- Tarjeta en Hoy ----------
function renderFlowCard() {
  const el = $('flowCard'); if (!el) return;
  const xp = flowXpToday(), pct = Math.min(100, Math.round((xp / FLOW_GOAL) * 100));
  el.innerHTML = `<div class="fl-card-row">
      <div><div class="hero-kicker">⚡ Flow · 4 min</div>
      <div class="fl-card-title">${xp >= FLOW_GOAL ? 'Goal done. Want more?' : xp ? 'Keep the flow going' : 'Instead of scrolling, play a round'}</div>
      <div class="small muted">Read, listen, build, think. 100 % English, works offline.</div></div>
      <button type="button" class="btn primary big" id="flowStart">▶ Play</button></div>
    <div class="fl-goal"><div class="fl-goal-bar"><div style="width:${pct}%"></div></div><div class="small muted">${xp} / ${FLOW_GOAL} XP today</div></div>
    <div class="small muted" id="offlineStatus"></div>`;
  $('flowStart').onclick = openFlow;
  checkOffline();
}

// ---------- Comprobación offline ----------
async function checkOffline() {
  const el = $('offlineStatus'); if (!el) return;
  if (!('caches' in window) || !('serviceWorker' in navigator)) { el.textContent = ''; return; }
  try {
    const keys = await caches.keys();
    const files = ['./index.html', './app.js', './flow.js', './flow-content.js', './course.js', './content.js'];
    let ok = false;
    for (const k of keys) {
      const c = await caches.open(k);
      const hits = await Promise.all(files.map(f => c.match(f, { ignoreSearch: true })));
      if (hits.every(Boolean)) { ok = true; break; }
    }
    el.innerHTML = ok ? '✈️ Ready for airplane mode' : '⏳ Preparing offline mode… open again with Wi-Fi in a few seconds';
  } catch { el.textContent = ''; }
}
if ('speechSynthesis' in window) speechSynthesis.getVoices();
