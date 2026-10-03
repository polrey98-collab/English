'use strict';

// =====================================================================
// CONFIG
// =====================================================================
const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64]; // días por caja (Leitner)
const MASTERED_BOX = 5;
const REVIEW_MAX = 25;          // tarjetas por sesión en la pestaña Repaso
const REVIEW_IN_SESSION = 10;   // tarjetas en el calentamiento de cada sesión
const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const STEP_INFO = {
  review:    { icon: '🃏', name: 'Repaso' },
  vocab:     { icon: '📚', name: 'Vocabulario' },
  vocabQuiz: { icon: '🎯', name: 'Quiz de vocabulario' },
  reading:   { icon: '📖', name: 'Lectura' },
  grammar:   { icon: '🏗️', name: 'Gramática' },
  exercises: { icon: '✏️', name: 'Ejercicios' },
  listening: { icon: '🎧', name: 'Listening' },
  shadowing: { icon: '🦜', name: 'Shadowing' },
  vocabGap:  { icon: '🧩', name: 'Vocabulario en contexto' },
  speaking:  { icon: '🗣️', name: 'Speaking' },
  writing:   { icon: '✍️', name: 'Writing' },
  unitTest:  { icon: '🏁', name: 'Test de unidad' },
  placement: { icon: '📏', name: 'Test de nivel' },
};

const K = {
  days: 'en_days', legacy: 'en_tracker', progress: 'en_progress', srs: 'en_srs', custom: 'en_custom',
  tests: 'en_level_tests', settings: 'en_settings', resume: 'en_resume',
};
const DEFAULT_SETTINGS = { weekly: 5, newPerDay: 5, voice: 'en-GB', rate: 0.95 };

// =====================================================================
// HELPERS
// =====================================================================
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => esc(s).replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
const plain = s => String(s ?? '').replace(/\*/g, '');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const paras = t => t.split(/\n\s*\n/).map(p => `<p>${fmt(p).replace(/\n/g, '<br>')}</p>`).join('');

const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('⚠️ No se pudo guardar'); } },
};

function keyOf(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function parseKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(k, n) { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
function todayKey() { return keyOf(new Date()); }
function diffDays(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
function mondayOf(k) { const d = parseKey(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return keyOf(d); }
function niceDate(k) { const d = parseKey(k); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
function hours(mins) { const h = mins / 60; return h >= 100 ? Math.round(h) : Math.round(h * 10) / 10; }
function dayIndex(k) { return Math.floor(parseKey(k).getTime() / 86400000); }

// Aleatorio reproducible (mismas opciones cada vez para la misma sesión)
function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
function shuffle(arr, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Normaliza respuestas: minúsculas, sin puntuación, contracciones expandidas
function canon(s) {
  return String(s).toLowerCase()
    .replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"')
    .replace(/\bwon't\b/g, 'will not').replace(/\bcan't\b/g, 'cannot').replace(/\bcan not\b/g, 'cannot')
    .replace(/\bshan't\b/g, 'shall not').replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am').replace(/'re\b/g, ' are').replace(/'ve\b/g, ' have').replace(/'ll\b/g, ' will')
    .replace(/[.,!?;:"()—–-]/g, ' ').replace(/\s+/g, ' ').trim();
}
const isCorrect = (input, answers) => answers.some(a => canon(a) === canon(input));

// =====================================================================
// DATA
// =====================================================================
function getSettings() { return { ...DEFAULT_SETTINGS, ...store.get(K.settings, {}) }; }
function saveSettings(patch) { store.set(K.settings, { ...getSettings(), ...patch }); }

function normDay(d) {
  d = d || {};
  return { study: d.study || 0, reviewSecs: d.reviewSecs || 0, reviews: d.reviews || 0, newCards: d.newCards || 0, sessions: Array.isArray(d.sessions) ? d.sessions.slice() : [] };
}
function getDays() { return store.get(K.days, {}); }
function getDay(k) { return normDay(getDays()[k]); }
function saveDay(k, day) { const all = getDays(); all[k] = day; store.set(K.days, all); }
function legacyMins(k) {
  const d = store.get(K.legacy, {})[k];
  if (!d || !Array.isArray(d.tools) || !d.tools.length) return 0;
  return d.mins ? Object.values(d.mins).reduce((s, v) => s + (+v || 0), 0) || d.tools.length * 15 : d.tools.length * 15;
}
function dayMins(k) { const d = getDay(k); return d.study + Math.round(d.reviewSecs / 60); }
function isActive(k) { return dayMins(k) > 0 || getDay(k).reviews > 0 || legacyMins(k) > 0; }

function getProgress() { const p = store.get(K.progress, {}); return { sessions: p.sessions || {}, drafts: p.drafts || {} }; }
function saveProgress(p) { store.set(K.progress, p); }

function getSrs() { return store.get(K.srs, {}); }
function getCustom() { return store.get(K.custom, []); }
function getTests() { return store.get(K.tests, []).slice().sort((a, b) => a.date.localeCompare(b.date)); }

// Tarjetas: mazo general + vocabulario desbloqueado del curso + frases propias/fallos
function vocabCards() {
  const out = [];
  UNITS.forEach(u => u.vocab.forEach((v, i) => out.push({
    id: `v_${u.id}_${i}`, cat: 'vocab', q: 'Which word or expression matches this definition?',
    front: v.def, back: `*${v.w}* — ${v.ex}`, say: `${v.w}. ${v.ex}`,
  })));
  return out;
}
function allCards() {
  const srs = getSrs();
  return DECK.concat(vocabCards().filter(c => srs[c.id]), getCustom().map(c => ({ ...c, cat: 'mine' })));
}
function cardById(id) { return allCards().find(c => c.id === id); }

// Curso
const SESSIONS = UNITS.flatMap((u, ui) => DAYS.map(d => ({ sid: `${u.id}d${d.n}`, unit: u, ui, day: d })));
const sessionById = sid => SESSIONS.find(s => s.sid === sid);
function nextSession() { const p = getProgress(); return SESSIONS.find(s => !p.sessions[s.sid]) || null; }
function doneCount() { const p = getProgress(); return SESSIONS.filter(s => p.sessions[s.sid]).length; }

// =====================================================================
// UI BASICS
// =====================================================================
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function showModal(id) { $(id).classList.add('show'); }
function hideModal(id) { $(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if (e.target === o) hideModal(o.id); }));
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => hideModal(b.dataset.close)));

let currentPage = 'pageHoy';
function switchPage(pageId) {
  currentPage = pageId;
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === pageId));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === pageId));
  window.scrollTo({ top: 0 });
  renderPage(pageId);
}
document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => switchPage(b.dataset.page)));

// =====================================================================
// AUDIO: voz (TTS), grabación y reconocimiento
// =====================================================================
function voicesFor(lang) {
  const all = ('speechSynthesis' in window) ? speechSynthesis.getVoices() : [];
  const exact = all.filter(v => v.lang.replace('_', '-') === lang);
  return exact.length ? exact : all.filter(v => v.lang.startsWith('en'));
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

function speak(text, opts = {}) {
  if (!('speechSynthesis' in window)) { toast('Tu navegador no tiene voz'); return; }
  const s = getSettings();
  if (!opts.queue) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(plain(text).replace(/_{2,}/g, 'blank'));
  u.lang = s.voice; u.rate = opts.rate || +s.rate;
  const vs = voicesFor(s.voice);
  if (vs.length) u.voice = vs[(opts.voiceIdx || 0) % vs.length];
  if (opts.pitch) u.pitch = opts.pitch;
  if (opts.onend) u.onend = opts.onend;
  speechSynthesis.speak(u);
  return u;
}
function stopSpeech() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }

// Reproduce un diálogo con una voz distinta para cada persona
function playDialogue(lines, onEnd) {
  stopSpeech();
  const speakers = [...new Set(lines.map(l => l[0]))];
  const multi = voicesFor(getSettings().voice).length > 1;
  lines.forEach(([who, text], i) => {
    const idx = speakers.indexOf(who);
    speak(text, { queue: true, voiceIdx: multi ? idx : 0, pitch: multi ? 1 : (idx ? 0.8 : 1.1), onend: i === lines.length - 1 ? onEnd : null });
  });
}

let activeRec = null;
async function toggleRecord(btn, onReady) {
  if (activeRec) { activeRec.stop(); return; }
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { toast('Tu navegador no permite grabar audio'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      activeRec = null;
      btn.classList.remove('rec'); btn.textContent = btn.dataset.label || '🎙️ Grabar';
      onReady(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' })));
    };
    rec.start();
    activeRec = rec;
    btn.dataset.label = btn.textContent;
    btn.classList.add('rec'); btn.textContent = '⏹ Parar';
  } catch { toast('Necesito permiso de micrófono para grabarte'); }
}
function stopRecording() { if (activeRec) activeRec.stop(); }

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listenOnce() {
  return new Promise((resolve, reject) => {
    const r = new SR();
    r.lang = getSettings().voice; r.interimResults = false; r.maxAlternatives = 1;
    r.onresult = e => resolve(e.results[0][0].transcript);
    r.onerror = e => reject(e.error);
    r.onend = () => resolve('');
    r.start();
  });
}
function compareSpeech(target, said) {
  const words = canon(target).split(' ');
  const bag = canon(said).split(' ');
  let hit = 0;
  const html = words.map(w => { const i = bag.indexOf(w); if (i >= 0) { bag.splice(i, 1); hit++; return `<span class="ok">${esc(w)}</span>`; } return `<span class="miss">${esc(w)}</span>`; }).join(' ');
  return { pct: Math.round(hit / words.length * 100), html };
}

// =====================================================================
// HEADER + STATS
// =====================================================================
function renderHeader() {
  const d = new Date();
  $('headerDate').textContent = `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  const last = getTests().slice(-1)[0];
  $('headerSub').textContent = `Tu curso de inglés · ${last ? `nivel ${last.level}` : 'B2'} → C1`;
}
function streak() {
  let k = todayKey();
  if (!isActive(k)) k = addDays(k, -1);
  let n = 0;
  while (isActive(k) && n < 5000) { n++; k = addDays(k, -1); }
  return n;
}
function totalStudyMins() { return Object.keys(getDays()).reduce((s, k) => s + dayMins(k), 0); }
function renderStats() {
  $('streakCurrent').textContent = streak();
  $('statSessions').textContent = doneCount();
  $('statHours').textContent = hours(totalStudyMins());
}

// =====================================================================
// HOY
// =====================================================================
function renderToday() {
  const t = todayKey(), day = getDay(t), s = getSettings();
  const res = getResume(), resSes = res && sessionById(res.sid);
  const next = resSes && !getProgress().sessions[res.sid] ? resSes : nextSession();
  const resuming = resSes && next === resSes;
  const doneToday = day.sessions.length > 0;
  const hasTest = getTests().length > 0;
  let html;

  if (!hasTest && doneCount() === 0 && !resuming) {
    html = `<div class="hero-kicker">Bienvenido 👋</div>
      <div class="hero-title">Empieza por el test de nivel</div>
      <p class="hero-sub">24 preguntas · 10 minutos. Te dice desde dónde partes y qué unidad te conviene.</p>
      <div class="hero-actions">
        <button type="button" class="btn primary" data-start="placement">📏 Hacer el test</button>
        <button type="button" class="btn" data-start="${SESSIONS[0].sid}">Saltar e ir a la unidad 1</button>
      </div>`;
  } else if (!next) {
    html = `<div class="hero-kicker">🎓 ¡Bloque completado!</div>
      <div class="hero-title">Has terminado las 8 unidades</div>
      <p class="hero-sub">Repite el test de nivel, rehaz las unidades con peor nota (pestaña Curso) y mantén el repaso diario.</p>
      <div class="hero-actions"><button type="button" class="btn primary" data-start="placement">📏 Repetir test de nivel</button></div>`;
  } else {
    const steps = next.day.steps.map((st, j) => `<span class="step-chip${resuming && j < res.i ? ' done' : ''}">${resuming && j < res.i ? '✓' : STEP_INFO[st].icon} ${STEP_INFO[st].name}</span>`).join('');
    html = `<div class="hero-kicker">${resuming ? `⏸ A medias · paso ${res.i + 1} de ${next.day.steps.length}` : doneToday ? '✅ Sesión de hoy hecha · ¿otra?' : 'Tu sesión de hoy'}</div>
      <div class="hero-title">${next.unit.emoji} ${esc(next.unit.title)}</div>
      <p class="hero-sub">Unidad ${next.ui + 1} · Sesión ${next.day.n}/5 — ${next.day.icon} ${esc(next.day.title)} · ≈ ${next.day.mins} min · <strong>se puede hacer por partes</strong>: si sales, se guarda por dónde vas.</p>
      <div class="step-chips">${steps}</div>
      <div class="hero-actions"><button type="button" class="btn primary big" data-start="${next.sid}">${resuming ? '▶ Continuar' : doneToday ? 'Hacer la siguiente' : '▶ Empezar'}</button></div>`;
  }
  $('todayCard').innerHTML = html;

  // Semana
  const monday = mondayOf(t);
  let weekDone = 0;
  $('weekDots').innerHTML = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(monday, i), d = getDay(k), n = d.sessions.length;
    weekDone += n;
    const cls = n ? 'done' : isActive(k) ? 'light' : '';
    return `<div class="wd ${cls}${k === t ? ' today' : ''}"><div class="wd-dot">${n ? '✓' : ''}</div><div class="wd-name">${DAY_SHORT[parseKey(k).getDay()]}</div></div>`;
  }).join('');
  $('weekGoalMeta').textContent = `${weekDone} / ${s.weekly} sesiones`;

  // Repaso
  const q = buildQueue('all');
  const pending = q.due.length + q.fresh.length;
  $('reviewMeta').textContent = day.reviews ? `${day.reviews} hechas hoy` : '';
  $('reviewTeaser').innerHTML = `<div class="teaser">
      <div class="teaser-num">${pending || '✓'}</div>
      <div class="teaser-txt">${pending ? `${q.due.length} pendientes · ${q.fresh.length} nuevas<br>≈ ${Math.max(2, Math.round(pending * 0.4))} min` : 'Todo repasado por hoy.'}</div>
      <button type="button" class="btn${pending ? ' primary' : ''}" id="goReview">${pending ? 'Repasar' : 'Ver'}</button></div>`;
  $('goReview').onclick = () => switchPage('pageRepaso');

  renderMission();

  const last = s.lastExport;
  $('backupTip').hidden = !(doneCount() >= 3 && (!last || diffDays(last, t) >= 14));
}

let missionOffset = 0;
function renderMission() {
  const n = dayIndex(todayKey()) + missionOffset;
  $('missionText').textContent = SELFTALK_MISSIONS[n % SELFTALK_MISSIONS.length];
}
$('missionNext').onclick = () => { missionOffset++; renderMission(); };

document.addEventListener('click', e => {
  const b = e.target.closest('[data-start]');
  if (b) openPlayer(b.dataset.start);
});

// =====================================================================
// CURSO
// =====================================================================
function renderCurso() {
  const tests = getTests(), last = tests.slice(-1)[0];
  $('placementCard').innerHTML = last
    ? `<div class="card-head"><div class="card-title">📏 Test de nivel</div><span class="cefr big">${esc(last.level)}</span></div>
       <p class="small">Último: ${last.score}/${last.total} el ${niceDate(last.date)}. ${esc(recommendation(last.level))}</p>
       <button type="button" class="btn" data-start="placement">Repetir test</button>`
    : `<div class="card-title">📏 Test de nivel</div>
       <p class="small">Aún no lo has hecho. 24 preguntas, 10 minutos: te dice desde dónde partes.</p>
       <button type="button" class="btn primary" data-start="placement">Hacer el test</button>`;

  const p = getProgress(), next = nextSession(), res = getResume();
  $('unitList').innerHTML = UNITS.map((u, ui) => {
    const ses = SESSIONS.filter(s => s.unit === u);
    const done = ses.filter(s => p.sessions[s.sid]).length;
    const scores = ses.map(s => p.sessions[s.sid]?.score).filter(v => typeof v === 'number');
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return `<div class="card unit${next && next.unit === u ? ' current' : ''}">
      <div class="unit-head">
        <div class="unit-emoji">${u.emoji}</div>
        <div class="unit-info">
          <div class="unit-title">${ui + 1}. ${esc(u.title)} <span class="tag">${u.level}</span></div>
          <div class="muted small">🏗️ ${esc(u.grammar.title)}</div>
        </div>
        <div class="unit-count">${done}/5${avg !== null ? `<small>${avg}%</small>` : ''}</div>
      </div>
      <div class="day-row">${ses.map(s => {
        const r = p.sessions[s.sid];
        const half = !r && res && res.sid === s.sid;
        const cls = r ? 'done' : half || (next && next.sid === s.sid) ? 'next' : '';
        return `<button type="button" class="day-btn ${cls}" data-start="${s.sid}" title="${esc(s.day.title)}">
          <span class="db-icon">${r ? '✓' : half ? '⏸' : s.day.icon}</span><span class="db-n">${s.day.n}</span>
          <span class="db-score">${r && typeof r.score === 'number' ? r.score + '%' : ''}</span></button>`;
      }).join('')}</div>
    </div>`;
  }).join('');
}

function recommendation(level) {
  return {
    B1: 'Empieza por la unidad 1 con calma y repite las sesiones en las que saques menos del 70 %.',
    B2: 'Empieza por la unidad 1: consolidarás la base B2 antes del salto.',
    'B2+': 'Puedes ir rápido en las unidades 1–3 y centrarte a partir de la 4.',
    C1: 'Estás cerca del C1: céntrate en las unidades 6–8, en el writing y en el repaso.',
  }[level] || '';
}

// =====================================================================
// REPASO (repetición espaciada)
// =====================================================================
function orderedNew(cards, srs, cat) {
  const fresh = cards.filter(c => !srs[c.id] && c.cat !== 'mine' && c.cat !== 'vocab');
  if (cat !== 'all') return fresh;
  const groups = CATEGORIES.map(ct => fresh.filter(c => c.cat === ct.id)).filter(g => g.length);
  const out = [];
  for (let i = 0; groups.some(g => i < g.length); i++) groups.forEach(g => { if (g[i]) out.push(g[i]); });
  return out;
}
function buildQueue(cat) {
  const t = todayKey(), srs = getSrs(), s = getSettings();
  const cards = allCards().filter(c => cat === 'all' || c.cat === cat);
  const due = cards.filter(c => srs[c.id] && srs[c.id].due <= t).sort((a, b) => srs[a.id].due.localeCompare(srs[b.id].due));
  const newLeft = Math.max(0, s.newPerDay - getDay(t).newCards);
  return { due, fresh: orderedNew(cards, srs, cat).slice(0, newLeft) };
}

let activeReview = null;

// Motor de repaso reutilizable (pestaña Repaso y calentamiento de las sesiones)
function ReviewSession(el, ids, { onDone, logTime = true, extra = false } = {}) {
  const S = { queue: ids.slice(), idx: 0, revealed: false, ok: 0, done: 0, failed: new Set(), lastTs: Date.now() };

  function render() {
    if (S.idx >= S.queue.length) { activeReview = null; onDone && onDone(S); return; }
    const c = cardById(S.queue[S.idx]);
    if (!c) { S.idx++; return render(); }
    const cat = CATEGORIES.find(x => x.id === c.cat) || { icon: '•', name: '' };
    const isNew = !getSrs()[c.id];
    el.innerHTML = `
      <div class="study-top">
        <div><span class="tag">${cat.icon} ${esc(cat.name)}</span>${isNew ? '<span class="tag new">NEW</span>' : ''}</div>
        <div class="card-meta">${S.idx + 1} / ${S.queue.length}</div>
      </div>
      <div class="progress"><div style="width:${(S.idx / S.queue.length) * 100}%"></div></div>
      <div class="study-q">${esc(c.q || Q[c.cat] || 'Recall the correct version.')}</div>
      <div class="study-front"><span>${fmt(c.front)}</span><button type="button" class="speak" data-say="front" aria-label="Escuchar">🔊</button></div>
      ${S.revealed ? `
        <div class="study-back"><span>${fmt(c.back)}</span><button type="button" class="speak" data-say="back" aria-label="Escuchar">🔊</button></div>
        ${c.note ? `<div class="study-note">${fmt(c.note)}</div>` : ''}` : ''}
      <div class="study-spacer"></div>
      ${S.revealed ? `
        <div class="study-actions">
          <button type="button" class="btn grade-no" data-grade="no">✗ No</button>
          <button type="button" class="btn grade-meh" data-grade="meh">~ Casi</button>
          <button type="button" class="btn grade-yes" data-grade="yes">✓ Sí</button>
        </div>` : `<div class="study-actions"><button type="button" class="btn primary" data-reveal>Mostrar respuesta</button></div>`}
      <div class="kbd-hint">Dilo en voz alta antes de girar · PC: espacio = girar · 1/2/3 = No/Casi/Sí</div>`;
    el.querySelectorAll('[data-say]').forEach(b => b.onclick = () => speak(b.dataset.say === 'front' ? c.front : (c.say || c.back)));
    const rv = el.querySelector('[data-reveal]'); if (rv) rv.onclick = reveal;
    el.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => grade(b.dataset.grade));
  }
  function reveal() { S.revealed = true; render(); }
  function grade(g) {
    const t = todayKey(), id = S.queue[S.idx], srs = getSrs();
    const isNew = !srs[id];
    const s = srs[id] || { box: 0, reps: 0, lapses: 0 };
    const firstTime = !S.failed.has(id);
    if (g === 'no') {
      s.box = 1; s.lapses++; s.due = addDays(t, 1);
      if (firstTime) { S.failed.add(id); S.queue.push(id); }
    } else if (g === 'meh') {
      s.box = Math.max(1, s.box); s.due = addDays(t, Math.max(1, Math.round(INTERVALS[s.box] / 2)));
    } else {
      s.box = S.failed.has(id) ? 1 : Math.min(s.box + 1, INTERVALS.length - 1); s.due = addDays(t, INTERVALS[s.box]);
    }
    s.reps++; s.seen = t; srs[id] = s; store.set(K.srs, srs);
    if (firstTime) { S.done++; if (g === 'yes') S.ok++; }

    const day = getDay(t), now = Date.now();
    day.reviews++;
    if (isNew && !extra) day.newCards++;
    if (logTime) day.reviewSecs += Math.min(120, Math.round((now - S.lastTs) / 1000));
    S.lastTs = now;
    saveDay(t, day);
    S.idx++; S.revealed = false;
    render();
  }
  const api = { key(e) {
    if (S.idx >= S.queue.length) return;
    if (e.code === 'Space' && !S.revealed) { e.preventDefault(); reveal(); }
    else if (S.revealed && ['1', '2', '3'].includes(e.key)) grade({ 1: 'no', 2: 'meh', 3: 'yes' }[e.key]);
  } };
  activeReview = api;
  render();
  return api;
}
document.addEventListener('keydown', e => {
  if (!activeReview) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  if (document.querySelector('.modal-overlay.show')) return;
  if (currentPage !== 'pageRepaso' && $('player').hidden) return;
  activeReview.key(e);
});

// ---------- Pestaña Repaso ----------
let studyCat = 'all';
function startRepaso(extraNew) {
  let { due, fresh } = buildQueue(studyCat);
  if (extraNew) fresh = orderedNew(allCards().filter(c => studyCat === 'all' || c.cat === studyCat), getSrs(), studyCat).slice(0, extraNew);
  const ids = [...due, ...fresh].slice(0, REVIEW_MAX).map(c => c.id);
  ReviewSession($('studyArea'), ids, { extra: !!extraNew, onDone: S => {
    const more = orderedNew(allCards().filter(c => studyCat === 'all' || c.cat === studyCat), getSrs(), studyCat).length;
    const pct = S.done ? Math.round(S.ok / S.done * 100) : 0;
    $('studyArea').innerHTML = `<div class="study-empty">
      <div class="big">${S.done ? '🎉' : '✅'}</div>
      <h3>${S.done ? '¡Repaso completado!' : 'Nada pendiente aquí'}</h3>
      <p>${S.done ? `${S.done} tarjetas · ${pct}% a la primera.<br>` : ''}Cada tarjeta vuelve justo cuando estás a punto de olvidarla.</p>
      ${more ? '<button type="button" class="btn primary" id="moreNew">+5 nuevas</button>' : ''}
      <button type="button" class="btn" id="backHome">Volver a Hoy</button></div>`;
    if (more) $('moreNew').onclick = () => startRepaso(5);
    $('backHome').onclick = () => switchPage('pageHoy');
    renderCatChips(); renderStats();
  } });
}
function renderCatChips() {
  const t = todayKey(), srs = getSrs(), cards = allCards();
  const n = cat => cards.filter(c => (cat === 'all' || c.cat === cat) && srs[c.id] && srs[c.id].due <= t).length;
  $('catChips').innerHTML = [{ id: 'all', name: 'Todo', icon: '✨' }, ...CATEGORIES].map(c => {
    const k = n(c.id);
    return `<button type="button" class="chip${studyCat === c.id ? ' active' : ''}" data-cat="${c.id}">${c.icon} ${esc(c.name)}${k ? `<span class="count">${k}</span>` : ''}</button>`;
  }).join('');
}
$('catChips').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  studyCat = b.dataset.cat; renderCatChips(); startRepaso();
});

$('mineForm').addEventListener('submit', e => {
  e.preventDefault();
  const front = $('mineFront').value.trim(), back = $('mineBack').value.trim(), note = $('mineNote').value.trim();
  if (!front || !back) return;
  addCustomCard({ id: 'u' + Date.now().toString(36), front, back, note, q: 'Recall the correct / natural version.' }, todayKey());
  e.target.reset();
  toast('📝 Añadida al repaso');
  renderMine(); renderCatChips();
});
function addCustomCard(card, due) {
  const custom = getCustom();
  if (custom.some(c => c.id === card.id)) return false;
  custom.push({ ...card, created: todayKey() });
  store.set(K.custom, custom);
  const srs = getSrs();
  if (!srs[card.id]) srs[card.id] = { box: 0, reps: 0, lapses: 0, due };
  store.set(K.srs, srs);
  return true;
}
function renderMine() {
  const custom = getCustom();
  $('mineCount').textContent = custom.length ? `${custom.length} frases` : '';
  $('mineList').innerHTML = custom.slice().reverse().slice(0, 60).map(c => `
    <div class="mine-item">
      <div><div class="wrong">${fmt(c.front)}</div><div class="right">${fmt(c.back)}</div>${c.note ? `<div class="muted small">${esc(c.note)}</div>` : ''}</div>
      <button type="button" class="del" data-del="${esc(c.id)}" aria-label="Borrar">×</button>
    </div>`).join('');
}
$('mineList').addEventListener('click', e => {
  const b = e.target.closest('[data-del]'); if (!b) return;
  if (!confirm('¿Borrar esta frase?')) return;
  store.set(K.custom, getCustom().filter(c => c.id !== b.dataset.del));
  const srs = getSrs(); delete srs[b.dataset.del]; store.set(K.srs, srs);
  renderMine(); renderCatChips();
});
function renderRepaso() { renderCatChips(); startRepaso(); renderMine(); }

// =====================================================================
// EJERCICIOS (motor común para quizzes, lectura, listening, tests)
// =====================================================================
function renderQuestions(el, items) {
  const chosen = {};
  el.innerHTML = `<div class="qs">${items.map((it, i) => {
    let body;
    if (it.type === 'choice') body = `<div class="opts">${it.options.map((o, j) => `<button type="button" class="opt" data-q="${i}" data-o="${j}">${fmt(o)}</button>`).join('')}</div>`;
    else body = `<input class="qi-in" data-q="${i}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${it.type === 'fix' ? 'Write the correct sentence' : 'Your answer'}">`;
    const lead = it.type === 'fix' ? '<span class="qi-tag">Fix it</span> ' : '';
    return `<div class="qi" data-i="${i}"><div class="qi-q"><span class="qi-n">${i + 1}</span><span>${lead}${fmt(it.q)}</span></div>${body}<div class="qi-fb"></div></div>`;
  }).join('')}</div>`;
  el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (el.dataset.checked) return;
    const q = +b.dataset.q;
    chosen[q] = +b.dataset.o;
    el.querySelectorAll(`.opt[data-q="${q}"]`).forEach(x => x.classList.toggle('sel', x === b));
  });
  return {
    check() {
      el.dataset.checked = '1';
      let ok = 0; const wrong = [];
      items.forEach((it, i) => {
        const row = el.querySelector(`.qi[data-i="${i}"]`), fb = row.querySelector('.qi-fb');
        let good;
        if (it.type === 'choice') {
          good = chosen[i] === it.a;
          row.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j === it.a) b.classList.add('right'); else if (j === chosen[i]) b.classList.add('wrong'); });
          fb.innerHTML = good ? '' : (it.why ? fmt(it.why) : '');
        } else {
          const inp = row.querySelector('input'); inp.disabled = true;
          good = isCorrect(inp.value, it.a);
          inp.classList.add(good ? 'right' : 'wrong');
          fb.innerHTML = good ? '' : `✓ <strong>${esc(it.a[0])}</strong>${it.a.length > 1 ? ` <span class="muted">(también: ${it.a.slice(1, 3).map(esc).join(' · ')})</span>` : ''}`;
        }
        row.classList.add(good ? 'is-right' : 'is-wrong');
        if (good) ok++; else wrong.push(it);
      });
      return { ok, total: items.length, wrong };
    },
  };
}

// Convierte un ejercicio fallado en tarjeta de repaso
function failToCard(it, unit) {
  let back;
  const ans = it.type === 'choice' ? it.options[it.a] : it.a[0];
  if (it.type === 'fix') back = it.a[0];
  else if (it.q.includes('___')) back = it.q.replace(/___(\s*\([^)]*\))?/, `*${ans}*`).replace(/\s*\((possible|reduced clause)\)\s*$/, '');
  else back = ans;
  let h = 0; for (const ch of it.q) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const front = it.type === 'choice' && !it.q.includes('___') ? `${it.q} (${it.options.join(' / ')})` : it.q;
  return { id: `f_${unit ? unit.id : 'x'}_${(h >>> 0).toString(36)}`, front, back, note: unit ? `Unit ${UNITS.indexOf(unit) + 1} · ${unit.grammar.title}` : '', q: it.type === 'fix' ? 'Fix the mistake.' : 'Complete it correctly.' };
}

// =====================================================================
// PLAYER (sesión guiada paso a paso)
// =====================================================================
let P = null; // estado de la sesión en curso

function openPlayer(sid) {
  let steps, title, unit = null, ses = null;
  if (sid === 'placement') { steps = ['placement']; title = '📏 Test de nivel'; }
  else {
    ses = sessionById(sid); if (!ses) return;
    unit = ses.unit; steps = ses.day.steps; title = `${unit.emoji} ${unit.title} · ${ses.day.icon} ${ses.day.title}`;
  }
  P = { sid, ses, unit, steps, i: 0, elapsed: 0, activeSince: Date.now(), graded: [], fails: 0, ended: false };
  // ¿Sesión a medias? Se retoma en el paso donde la dejaste
  const r = getResume();
  if (r && r.sid === sid && r.i > 0 && r.i < steps.length) {
    Object.assign(P, { i: r.i, elapsed: r.elapsed || 0, graded: r.graded || [], fails: r.fails || 0 });
    toast(`▶ Retomando en el paso ${r.i + 1} de ${steps.length}`);
  }
  $('playerTitle').textContent = title;
  $('player').hidden = false;
  document.body.classList.add('no-scroll');
  history.pushState({ player: true }, '');
  renderStep();
}
function getResume() {
  const r = store.get(K.resume, null);
  return r && r.saved && diffDays(r.saved, todayKey()) <= 14 ? r : null;
}
function activeMs() { return P.elapsed + (P.activeSince ? Date.now() - P.activeSince : 0); }
function saveResume() {
  if (!P || P.ended || P.sid === 'placement') return;
  store.set(K.resume, { sid: P.sid, i: P.i, elapsed: activeMs(), graded: P.graded.map(g => ({ ok: g.ok, total: g.total })), fails: P.fails, saved: todayKey() });
}
let ignorePop = false;
function closePlayer(fromBack) {
  if (!P) return;
  if (!P.ended && P.i > 0) { saveResume(); toast('💾 Guardado. Retomarás en el paso ' + (P.i + 1)); }
  stopSpeech(); stopRecording();
  activeReview = null;
  $('player').hidden = true;
  document.body.classList.remove('no-scroll');
  P = null;
  if (!fromBack && history.state && history.state.player) { ignorePop = true; history.back(); }
  renderAll();
}
$('playerClose').onclick = () => closePlayer(false);
// Botón "atrás" de Android: cierra la sesión (guardando) en vez de salir de la app
window.addEventListener('popstate', () => { if (ignorePop) { ignorePop = false; return; } if (P) closePlayer(true); });
// Si sales de la app, se pausa el cronómetro y se guarda por dónde vas
document.addEventListener('visibilitychange', () => {
  if (!P || P.ended) return;
  if (document.visibilityState === 'hidden') { P.elapsed = activeMs(); P.activeSince = null; saveResume(); }
  else if (!P.activeSince) P.activeSince = Date.now();
});

function setFoot(label, handler, hint = '') {
  const b = $('playerNext');
  b.textContent = label; b.disabled = !handler; b.onclick = handler || null;
  $('playerHint').textContent = hint;
}
function nextStep() {
  stopSpeech(); stopRecording();
  P.i++;
  if (P.i >= P.steps.length) finishSession(); else { saveResume(); renderStep(); }
}
function renderStep() {
  const st = P.steps[P.i];
  $('playerSteps').innerHTML = P.steps.map((s, j) => `<span class="ps ${j < P.i ? 'done' : j === P.i ? 'cur' : ''}">${STEP_INFO[s].icon}</span>`).join('');
  const body = $('playerBody');
  body.innerHTML = '';
  $('player').scrollTop = 0; body.scrollTop = 0;
  window.scrollTo({ top: 0 });
  STEPS[st](body, P.unit);
}

// Pasos corregibles: botón "Comprobar" → "Continuar"
function gradedStep(el, items, { onCheck, label = 'Comprobar' } = {}) {
  const qs = renderQuestions(el, items);
  setFoot(label, () => {
    const r = qs.check();
    P.graded.push(r);
    onCheck && onCheck(r);
    const pct = Math.round(r.ok / r.total * 100);
    toast(pct === 100 ? '🎯 ¡Perfecto!' : `${r.ok}/${r.total} correctas`);
    setFoot('Continuar', nextStep, `${r.ok}/${r.total} · ${pct}%`);
  }, `${items.length} preguntas`);
}

function saveFails(wrong) {
  let n = 0;
  wrong.filter(it => it.src === 'grammar').forEach(it => { if (addCustomCard(failToCard(it, P.unit), addDays(todayKey(), 1))) n++; });
  P.fails += n;
}

const STEPS = {
  // ---------- Calentamiento: repaso ----------
  review(el) {
    const { due, fresh } = buildQueue('all');
    const ids = [...due, ...fresh].slice(0, REVIEW_IN_SESSION).map(c => c.id);
    el.innerHTML = `<h2 class="step-h">🃏 Calentamiento: repaso</h2><p class="step-p">Recuerda antes de aprender algo nuevo. Responde en voz alta antes de girar la tarjeta.</p><div class="card study" id="stepStudy"></div>`;
    if (!ids.length) {
      $('stepStudy').innerHTML = '<div class="study-empty"><div class="big">✅</div><h3>Nada que repasar ahora</h3><p>Sigue con la sesión.</p></div>';
      setFoot('Continuar', nextStep); return;
    }
    setFoot('Saltar repaso', nextStep, `${ids.length} tarjetas`);
    ReviewSession($('stepStudy'), ids, { logTime: false, onDone: S => {
      $('stepStudy').innerHTML = `<div class="study-empty"><div class="big">💪</div><h3>Repaso hecho</h3><p>${S.done} tarjetas · ${S.done ? Math.round(S.ok / S.done * 100) : 0}% a la primera.</p></div>`;
      setFoot('Continuar', nextStep);
    } });
  },

  // ---------- Vocabulario ----------
  vocab(el, u) {
    el.innerHTML = `<h2 class="step-h">📚 New words</h2>
      <p class="step-p">Escucha cada palabra, repítela en voz alta y <strong>di tu propia frase</strong> con ella. Al continuar, entran en tu repaso.</p>
      ${u.vocab.map((v, i) => `<div class="card vocab">
        <div class="vocab-top"><div class="vocab-w">${esc(v.w)}</div><button type="button" class="speak" data-v="${i}">🔊</button></div>
        <div class="vocab-def">${esc(v.def)}</div>
        <div class="vocab-ex">${fmt(v.ex.replace(new RegExp(v.w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'), m => `*${m}*`))}</div>
      </div>`).join('')}`;
    el.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { const v = u.vocab[+b.dataset.v]; speak(`${v.w}. ${v.ex}`); });
    setFoot('Ya las conozco → Continuar', () => {
      const srs = getSrs(), due = addDays(todayKey(), 1);
      u.vocab.forEach((_, i) => { const id = `v_${u.id}_${i}`; if (!srs[id]) srs[id] = { box: 0, reps: 0, lapses: 0, due }; });
      store.set(K.srs, srs);
      toast('📚 10 palabras añadidas al repaso');
      nextStep();
    });
  },

  vocabQuiz(el, u) {
    const rnd = seeded(P.sid + 'vq');
    const items = shuffle(u.vocab, rnd).map(v => {
      const others = shuffle(u.vocab.filter(x => x !== v), rnd).slice(0, 3).map(x => x.w);
      const options = shuffle([v.w, ...others], rnd);
      return { type: 'choice', q: `"${v.def}"`, options, a: options.indexOf(v.w) };
    });
    el.innerHTML = `<h2 class="step-h">🎯 Which word is it?</h2><p class="step-p">Elige la palabra que corresponde a cada definición.</p><div id="qz"></div>`;
    gradedStep($('qz'), items);
  },

  reading(el, u) {
    const r = u.reading;
    el.innerHTML = `<h2 class="step-h">📖 Reading</h2>
      <p class="step-p">Lee el texto sin traducir. Si una palabra no la sabes, intenta deducirla por el contexto. Luego responde.</p>
      <div class="card text-card"><div class="text-head"><h3>${esc(r.title)}</h3><button type="button" class="btn small-btn" id="readAloud">🔊 Escuchar</button></div>${paras(r.text)}</div>
      <h3 class="sub-h">Questions</h3><div id="qz"></div>`;
    let playing = false;
    $('readAloud').onclick = () => {
      if (playing) { stopSpeech(); playing = false; $('readAloud').textContent = '🔊 Escuchar'; return; }
      playing = true; $('readAloud').textContent = '⏹ Parar';
      const ps = r.text.split(/\n\s*\n/);
      ps.forEach((p, i) => speak(p, { queue: i > 0, onend: i === ps.length - 1 ? () => { playing = false; $('readAloud').textContent = '🔊 Escuchar'; } : null }));
    };
    gradedStep($('qz'), r.questions.map(q => ({ type: 'choice', ...q })));
  },

  // ---------- Gramática ----------
  grammar(el, u) {
    const g = u.grammar;
    el.innerHTML = `<h2 class="step-h">🏗️ ${esc(g.title)}</h2>
      <div class="card">${g.explain.map(x => `<p class="g-p">${fmt(x)}</p>`).join('')}</div>
      <div class="card trap">⚠️ <strong>Trampa para hispanohablantes:</strong> ${fmt(g.trap)}</div>
      <p class="step-p">Lee los ejemplos en voz alta. En el siguiente paso practicarás.</p>`;
    setFoot('Practicar →', nextStep);
  },

  exercises(el, u) {
    el.innerHTML = `<h2 class="step-h">✏️ Practice: ${esc(u.grammar.title)}</h2><p class="step-p">Escribe solo lo que falta (o la frase completa en "Fix it"). Los fallos se guardan en tu repaso.</p><div id="qz"></div>`;
    gradedStep($('qz'), u.grammar.exercises.map(x => ({ ...x, src: 'grammar' })), { onCheck: r => saveFails(r.wrong) });
  },

  // ---------- Listening ----------
  listening(el, u) {
    const L = u.listening;
    el.innerHTML = `<h2 class="step-h">🎧 Listening: ${esc(L.title)}</h2>
      <p class="step-p">Escucha <strong>sin leer</strong>. Puedes repetirlo las veces que quieras. La transcripción aparece al comprobar.</p>
      <div class="card player-audio">
        <button type="button" class="btn primary" id="lPlay">▶ Escuchar</button>
        <button type="button" class="btn" id="lSlow">🐢 Más lento</button>
        <div class="muted small" id="lInfo">${Object.values(L.speakers).map(esc).join(' · ')}</div>
      </div>
      <div id="qz"></div>
      <div class="card transcript" id="transcript" hidden>${L.lines.map(([w, t]) => `<p><strong>${esc(L.speakers[w] || w)}:</strong> ${esc(t)}</p>`).join('')}</div>`;
    let playing = false;
    const play = rate => {
      if (playing) { stopSpeech(); playing = false; $('lPlay').textContent = '▶ Escuchar'; return; }
      playing = true; $('lPlay').textContent = '⏹ Parar';
      const s = getSettings();
      if (rate) saveSettings({ rate }); // temporal para esta reproducción
      playDialogue(L.lines, () => { playing = false; $('lPlay').textContent = '▶ Escuchar'; });
      if (rate) saveSettings({ rate: s.rate });
    };
    $('lPlay').onclick = () => play();
    $('lSlow').onclick = () => { if (playing) play(); play(0.75); };
    gradedStep($('qz'), L.questions.map(q => ({ type: 'choice', ...q })), { onCheck: () => { $('transcript').hidden = false; } });
  },

  shadowing(el, u) {
    el.innerHTML = `<h2 class="step-h">🦜 Shadowing</h2>
      <p class="step-p">Para cada frase: 1) escúchala, 2) repítela <strong>a la vez</strong> imitando el ritmo y la entonación, 3) grábate y compárate. 2–3 veces cada una.</p>
      ${u.shadowing.map((s, i) => `<div class="card sh" data-i="${i}">
        <div class="sh-text">${esc(s)}</div>
        <div class="sh-actions">
          <button type="button" class="btn small-btn" data-act="play">🔊</button>
          <button type="button" class="btn small-btn" data-act="slow">🐢</button>
          <button type="button" class="btn small-btn" data-act="rec">🎙️ Grabar</button>
          ${SR ? '<button type="button" class="btn small-btn" data-act="check">✅ Comprobar</button>' : ''}
        </div>
        <audio controls hidden></audio>
        <div class="sh-result"></div>
      </div>`).join('')}
      ${SR ? '' : '<p class="muted small">Tu navegador no tiene reconocimiento de voz: usa la grabación para compararte de oído.</p>'}`;
    el.querySelectorAll('.sh').forEach(card => {
      const text = u.shadowing[+card.dataset.i];
      card.querySelector('[data-act="play"]').onclick = () => speak(text);
      card.querySelector('[data-act="slow"]').onclick = () => speak(text, { rate: 0.7 });
      const recBtn = card.querySelector('[data-act="rec"]');
      recBtn.onclick = () => toggleRecord(recBtn, url => { const a = card.querySelector('audio'); a.src = url; a.hidden = false; });
      const ck = card.querySelector('[data-act="check"]');
      if (ck) ck.onclick = async () => {
        ck.textContent = '👂 Escuchando…'; ck.disabled = true;
        try {
          const said = await listenOnce();
          const r = compareSpeech(text, said);
          card.querySelector('.sh-result').innerHTML = said ? `<div class="sh-score ${r.pct >= 80 ? 'good' : ''}">${r.pct}%</div><div>${r.html}</div>` : '<span class="muted">No te he oído. Inténtalo otra vez.</span>';
        } catch { card.querySelector('.sh-result').innerHTML = '<span class="muted">El reconocimiento de voz no está disponible aquí. Usa 🎙️ Grabar.</span>'; }
        ck.textContent = '✅ Comprobar'; ck.disabled = false;
      };
    });
    setFoot('Terminado → Continuar', nextStep);
  },

  // ---------- Speaking ----------
  vocabGap(el, u) {
    const rnd = seeded(P.sid + 'vg');
    const items = shuffle(u.vocab, rnd).map(v => {
      const re = new RegExp(v.w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      const m = v.ex.match(re);
      return m ? { type: 'gap', q: v.ex.replace(re, '___'), a: [m[0]] } : null;
    }).filter(Boolean).slice(0, 8);
    el.innerHTML = `<h2 class="step-h">🧩 Words in context</h2><p class="step-p">Completa con la palabra o expresión de esta unidad.</p>
      <div class="word-bank">${shuffle(u.vocab.map(v => v.w), rnd).map(w => `<span>${esc(w)}</span>`).join('')}</div><div id="qz"></div>`;
    gradedStep($('qz'), items);
  },

  speaking(el, u) {
    const S = u.speaking;
    el.innerHTML = `<h2 class="step-h">🗣️ Speaking</h2>
      <div class="card prompt-card">${esc(S.prompt)}</div>
      <div class="card"><div class="sub-h">1 · Prepara (1 min, solo palabras clave, en inglés)</div><ul class="rules">${S.prep.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="sub-h">Frases útiles</div><div class="phrase-chips">${S.phrases.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
      <div class="card"><div class="sub-h">2 · Habla y grábate (técnica 4/3/2)</div>
        <p class="small">Cuéntalo durante <strong>4 min</strong>, repítelo en <strong>3 min</strong> y por último en <strong>2 min</strong>. Cada vuelta sale más fluida. No pares a traducir: si falta una palabra, rodéala.</p>
        <div class="timer-row"><div class="big-timer" id="spTimer">4:00</div>
          <div class="timer-btns"><button type="button" class="btn small-btn" data-t="240">4 min</button><button type="button" class="btn small-btn" data-t="180">3 min</button><button type="button" class="btn small-btn" data-t="120">2 min</button></div></div>
        <button type="button" class="btn primary block" id="spRec">🎙️ Grabar</button>
        <div id="spTakes"></div>
      </div>
      <div class="card"><div class="sub-h">3 · Escúchate</div><p class="small">¿Qué palabra te faltó? ¿Qué error se repite? Apúntalo en <strong>Mis frases</strong> (pestaña Repaso).</p></div>`;
    let timer = null, left = 240;
    const show = () => { $('spTimer').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; };
    el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
      clearInterval(timer); left = +b.dataset.t; show();
      timer = setInterval(() => { left--; show(); if (left <= 0) { clearInterval(timer); if (navigator.vibrate) navigator.vibrate(300); toast('⏰ ¡Tiempo!'); stopRecording(); } }, 1000);
    });
    let takes = 0;
    $('spRec').onclick = () => toggleRecord($('spRec'), url => {
      takes++;
      $('spTakes').insertAdjacentHTML('beforeend', `<div class="take">Toma ${takes} <audio controls src="${url}"></audio></div>`);
      setFoot('Continuar', nextStep, `${takes} grabación${takes > 1 ? 'es' : ''}`);
    });
    const obs = new MutationObserver(() => { if (!document.body.contains($('spTimer'))) { clearInterval(timer); obs.disconnect(); } });
    obs.observe($('playerBody'), { childList: true });
    setFoot('Continuar', nextStep, 'Grábate al menos una vez');
  },

  // ---------- Writing ----------
  writing(el, u) {
    const W = u.writing, p = getProgress();
    el.innerHTML = `<h2 class="step-h">✍️ Writing</h2>
      <div class="card prompt-card">${esc(W.prompt)}<div class="muted small">${W.words[0]}–${W.words[1]} palabras · sin traductor</div></div>
      <div class="card"><div class="sub-h">Lenguaje útil</div><div class="phrase-chips">${W.useful.map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
      <textarea class="writer" id="wText" placeholder="Start writing here…">${esc(p.drafts[u.id] || '')}</textarea>
      <div class="wc" id="wCount"></div>
      <div class="card"><div class="sub-h">Autocorrección</div>${W.checklist.map((c, i) => `<label class="chk"><input type="checkbox" data-c="${i}"> ${esc(c)}</label>`).join('')}</div>
      <div class="w-actions">
        <button type="button" class="btn" id="wModel">👀 Ver texto modelo</button>
        <button type="button" class="btn" id="wCopy">📋 Copiar para corregir con Claude</button>
      </div>
      <div class="card model" id="wModelBox" hidden><div class="sub-h">Model answer</div>${paras(W.model)}</div>`;
    const ta = $('wText');
    const count = () => {
      const n = (ta.value.match(/[A-Za-zÀ-ÿ0-9'’-]+/g) || []).length;
      const okRange = n >= W.words[0] && n <= W.words[1] + 30;
      $('wCount').innerHTML = `<span class="${okRange ? 'ok' : ''}">${n} palabras</span> · objetivo ${W.words[0]}–${W.words[1]}`;
      const pr = getProgress(); pr.drafts[u.id] = ta.value; saveProgress(pr);
      setFoot('Continuar', n >= 40 ? nextStep : null, n >= 40 ? '' : 'Escribe al menos 40 palabras');
    };
    ta.addEventListener('input', count); count();
    $('wModel').onclick = () => {
      if ((ta.value.match(/\S+/g) || []).length < 40 && !confirm('Mejor escribe tu texto antes de ver el modelo. ¿Verlo igualmente?')) return;
      $('wModelBox').hidden = false; $('wModelBox').scrollIntoView({ behavior: 'smooth' });
    };
    $('wCopy').onclick = async () => {
      const txt = `Please correct my English text. List each mistake with a short explanation (in simple English), then rewrite the text at C1 level, keeping my ideas.\n\nTask: ${W.prompt}\n\nMy text:\n${ta.value}`;
      try { await navigator.clipboard.writeText(txt); toast('📋 Copiado. Pégalo en Claude.'); } catch { toast('No se pudo copiar'); }
    };
  },

  unitTest(el, u) {
    const rnd = seeded(P.sid + todayKey());
    const vocab = shuffle(u.vocab, rnd).slice(0, 5).map(v => {
      const re = new RegExp(v.w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      const m = v.ex.match(re);
      return m ? { type: 'gap', q: v.ex.replace(re, '___'), a: [m[0]] } : null;
    }).filter(Boolean);
    const gram = shuffle(u.grammar.exercises, rnd).slice(0, 5).map(x => ({ ...x, src: 'grammar' }));
    el.innerHTML = `<h2 class="step-h">🏁 Unit test</h2><p class="step-p">Vocabulario y gramática de la unidad. Intenta sacar un 80 % o más.</p><div id="qz"></div>`;
    gradedStep($('qz'), shuffle([...vocab, ...gram], rnd), { onCheck: r => saveFails(r.wrong) });
  },

  placement(el) {
    el.innerHTML = `<h2 class="step-h">📏 Level test</h2><p class="step-p">24 preguntas de dificultad creciente. No adivines: si no lo sabes, deja la respuesta en blanco. El resultado es orientativo.</p><div id="qz"></div>`;
    gradedStep($('qz'), PLACEMENT.map(q => ({ type: 'choice', ...q })), {
      label: 'Ver resultado',
      onCheck: r => {
        const level = placementLevel(r.ok, r.total);
        const tests = store.get(K.tests, []);
        tests.push({ date: todayKey(), score: r.ok, total: r.total, level });
        store.set(K.tests, tests);
        P.placement = { ...r, level };
      },
    });
  },
};

function finishSession() {
  P.ended = true;
  const mins = clamp(Math.round(activeMs() / 60000), 1, 90);
  if (P.sid !== 'placement') localStorage.removeItem(K.resume);
  const ok = P.graded.reduce((s, r) => s + r.ok, 0), total = P.graded.reduce((s, r) => s + r.total, 0);
  const score = total ? Math.round(ok / total * 100) : null;
  const t = todayKey(), day = getDay(t);
  day.study += mins;
  if (P.sid !== 'placement') day.sessions.push(P.sid);
  saveDay(t, day);

  let html;
  if (P.sid === 'placement') {
    const pl = P.placement;
    html = `<div class="done-screen"><div class="big">📏</div><h2>Tu nivel: <span class="cefr big">${pl.level}</span></h2>
      <p>${pl.ok}/${pl.total} correctas.</p><p class="small">${esc(recommendation(pl.level))}</p>
      <p class="muted small">Repítelo cada 2 unidades para ver tu evolución.</p></div>`;
    setFoot('Ir al curso', () => { closePlayer(false); switchPage('pageCurso'); });
  } else {
    const p = getProgress(), prev = p.sessions[P.sid];
    p.sessions[P.sid] = { date: t, score, mins, times: (prev?.times || 0) + 1, best: Math.max(prev?.best ?? -1, score ?? -1) };
    saveProgress(p);
    const nxt = nextSession();
    html = `<div class="done-screen"><div class="big">🎉</div><h2>¡Sesión completada!</h2>
      <div class="done-stats">
        <div><b>${mins}</b><span>minutos</span></div>
        ${score !== null ? `<div><b>${score}%</b><span>aciertos</span></div>` : ''}
        <div><b>${streak()}</b><span>días de racha</span></div>
      </div>
      ${P.fails ? `<p class="small">📝 ${P.fails} fallo${P.fails > 1 ? 's' : ''} añadido${P.fails > 1 ? 's' : ''} a tu repaso: volverán hasta que los domines.</p>` : ''}
      ${score !== null && score < 70 ? '<p class="small">💡 Por debajo del 70 %: repite esta sesión otro día antes de avanzar demasiado.</p>' : ''}
      ${nxt ? `<p class="muted small">Siguiente: ${nxt.unit.emoji} ${esc(nxt.unit.title)} · ${nxt.day.icon} ${esc(nxt.day.title)}</p>` : '<p><strong>🎓 ¡Has terminado el bloque!</strong></p>'}
    </div>`;
    setFoot('Terminar', () => closePlayer(false));
  }
  $('playerSteps').innerHTML = P.steps.map(s => `<span class="ps done">${STEP_INFO[s].icon}</span>`).join('');
  $('playerBody').innerHTML = html;
  $('playerHint').textContent = '';
}

// =====================================================================
// PROGRESO
// =====================================================================
function renderProgreso() {
  const p = getProgress(), done = doneCount(), total = SESSIONS.length, t = todayKey();
  const scores = Object.values(p.sessions).map(s => s.score).filter(v => typeof v === 'number');
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  let last28 = 0, mins28 = 0;
  for (let i = 0; i < 28; i++) { const k = addDays(t, -i); last28 += getDay(k).sessions.length; mins28 += dayMins(k); }
  $('courseProgress').innerHTML = `
    <div class="goal"><div class="goal-top"><span>Bloque 1 (B2 → C1)</span><span>${done} / ${total} sesiones</span></div>
      <div class="bar"><div style="width:${done / total * 100}%"></div></div></div>
    <div class="stats-grid">
      <div class="stat-box"><div class="stat-box-num">${hours(totalStudyMins())} h</div><div class="stat-box-label">Estudio total</div></div>
      <div class="stat-box"><div class="stat-box-num" style="color:var(--green)">${scores.length ? avg + '%' : '–'}</div><div class="stat-box-label">Acierto medio</div></div>
      <div class="stat-box"><div class="stat-box-num">${(last28 / 4).toFixed(1)}</div><div class="stat-box-label">Sesiones/semana</div></div>
      <div class="stat-box"><div class="stat-box-num">${Math.round(mins28 / 28)}′</div><div class="stat-box-label">Min/día (28 d)</div></div>
    </div>`;
  let eta;
  if (done >= total) eta = '🎓 <strong>Bloque terminado.</strong> Repite el test de nivel y rehaz las unidades con peor nota.';
  else if (!last28) eta = `Con tu objetivo de <strong>${getSettings().weekly} sesiones/semana</strong> terminarías el bloque en unas <strong>${Math.ceil((total - done) / getSettings().weekly)} semanas</strong>.`;
  else {
    const weeks = Math.ceil((total - done) / (last28 / 4));
    const d = parseKey(addDays(t, weeks * 7));
    eta = `A tu ritmo actual terminarás el bloque hacia <strong>${MONTHS[d.getMonth()]} ${d.getFullYear()}</strong> (≈ ${weeks} semanas).`;
  }
  $('eta').innerHTML = eta;

  const tests = getTests();
  $('levelHistory').innerHTML = (tests.length ? tests.slice().reverse().map((x, i, arr) => {
    const prev = arr[i + 1], delta = prev ? x.score - prev.score : null;
    return `<div class="test-row"><div class="score">${x.score}<small>/${x.total}</small></div><div class="info">${niceDate(x.date)}</div>
      ${delta !== null ? `<div class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '+' : ''}${delta}</div>` : ''}
      <span class="cefr ${x.level.startsWith('C') ? 'c1' : ''}">${esc(x.level)}</span></div>`;
  }).join('') : '<p class="small">Aún no has hecho el test de nivel.</p>') + `<button type="button" class="btn" data-start="placement" style="margin-top:10px">📏 ${tests.length ? 'Repetir' : 'Hacer'} test</button>`;

  $('unitScores').innerHTML = UNITS.map((u, ui) => {
    const ses = SESSIONS.filter(s => s.unit === u);
    const d = ses.filter(s => p.sessions[s.sid]).length;
    const sc = ses.map(s => p.sessions[s.sid]?.score).filter(v => typeof v === 'number');
    const a = sc.length ? Math.round(sc.reduce((x, y) => x + y, 0) / sc.length) : null;
    return `<div class="bar-row"><div class="name">${u.emoji} ${ui + 1}. ${esc(u.title)}</div>
      <div class="bar ${a !== null && a >= 80 ? 'green' : ''}"><div style="width:${a ?? 0}%"></div></div>
      <div class="val">${a !== null ? a + '%' : `${d}/5`}</div></div>`;
  }).join('');

  const srs = getSrs(), cards = allCards();
  let mastered = 0, learning = 0;
  cards.forEach(c => { const s = srs[c.id]; if (!s || !s.reps) return; if (s.box >= MASTERED_BOX) mastered++; else learning++; });
  let week = 0; for (let i = 0; i < 7; i++) week += getDay(addDays(t, -i)).reviews;
  $('deckStats').innerHTML = `
    <div class="stat-box"><div class="stat-box-num" style="color:var(--green)">${mastered}</div><div class="stat-box-label">Dominadas</div></div>
    <div class="stat-box"><div class="stat-box-num" style="color:var(--amber)">${learning}</div><div class="stat-box-label">Aprendiendo</div></div>
    <div class="stat-box"><div class="stat-box-num">${cards.length - mastered - learning}</div><div class="stat-box-label">Por ver</div></div>
    <div class="stat-box"><div class="stat-box-num" style="color:var(--accent)">${week}</div><div class="stat-box-label">Repasos · 7 días</div></div>`;

  const start = addDays(mondayOf(t), -15 * 7);
  let html = '';
  for (let i = 0; i < 16 * 7; i++) {
    const k = addDays(start, i);
    if (k > t) { html += '<div class="heat-cell future"></div>'; continue; }
    const m = dayMins(k) + legacyMins(k);
    const l = m === 0 ? '' : m < 10 ? 'l1' : m < 20 ? 'l2' : m < 35 ? 'l3' : 'l4';
    html += `<div class="heat-cell ${l}" title="${k}: ${m} min"></div>`;
  }
  $('heatmap').innerHTML = html;
}

// =====================================================================
// AJUSTES Y DATOS
// =====================================================================
function renderAjustes() {
  const s = getSettings();
  $('setWeekly').value = String(s.weekly);
  $('setNewPerDay').value = s.newPerDay;
  $('setVoice').value = s.voice;
  $('setRate').value = String(s.rate);
}
function bindSetting(id, key, parse) {
  $(id).addEventListener('change', e => {
    const v = parse(e.target.value);
    if (v === null) { renderAjustes(); return; }
    saveSettings({ [key]: v }); toast('Ajuste guardado ✓');
  });
}
bindSetting('setWeekly', 'weekly', v => clamp(parseInt(v, 10) || 5, 1, 7));
bindSetting('setNewPerDay', 'newPerDay', v => { const n = parseInt(v, 10); return n > 0 ? clamp(n, 3, 20) : null; });
bindSetting('setVoice', 'voice', v => v);
bindSetting('setRate', 'rate', v => +v);

function exportAll() {
  return {
    app: 'en-c1', version: 3, exported: new Date().toISOString(),
    days: getDays(), legacy: store.get(K.legacy, {}), progress: getProgress(),
    srs: getSrs(), custom: getCustom(), tests: store.get(K.tests, []), settings: store.get(K.settings, {}),
  };
}
$('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `en_c1_${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  saveSettings({ lastExport: todayKey() });
  toast('Datos exportados ✓');
};
$('importBtn').onclick = () => $('fileInput').click();
$('fileInput').addEventListener('change', function () {
  const file = this.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try { mergeImport(JSON.parse(ev.target.result)); toast('Datos importados y fusionados ✓'); renderAll(); }
    catch { toast('Error: archivo no válido'); }
  };
  reader.readAsText(file);
  this.value = '';
});

function mergeImport(obj) {
  if (!obj || typeof obj !== 'object') throw new Error('bad');
  const isV3 = obj.version === 3;
  // Datos del tracker antiguo (v1: días sueltos · v2: obj.days) → histórico
  const legacyIn = isV3 ? (obj.legacy || {}) : (obj.version === 2 ? obj.days || {} : obj);
  const legacy = store.get(K.legacy, {});
  Object.entries(legacyIn).forEach(([k, d]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !d || !Array.isArray(d.tools)) return;
    const cur = legacy[k] || { tools: [] };
    legacy[k] = { ...cur, ...d, tools: [...new Set([...(cur.tools || []), ...d.tools])] };
  });
  store.set(K.legacy, legacy);

  if (isV3) {
    const days = getDays();
    Object.entries(obj.days || {}).forEach(([k, raw]) => {
      const a = normDay(days[k]), b = normDay(raw);
      days[k] = { study: Math.max(a.study, b.study), reviewSecs: Math.max(a.reviewSecs, b.reviewSecs), reviews: Math.max(a.reviews, b.reviews), newCards: Math.max(a.newCards, b.newCards), sessions: [...new Set([...a.sessions, ...b.sessions])] };
    });
    store.set(K.days, days);
    const p = getProgress(), ip = obj.progress || {};
    Object.entries(ip.sessions || {}).forEach(([sid, r]) => {
      const c = p.sessions[sid];
      if (!c || (r.times || 0) > (c.times || 0)) p.sessions[sid] = r;
    });
    Object.entries(ip.drafts || {}).forEach(([u, txt]) => { if ((txt || '').length > (p.drafts[u] || '').length) p.drafts[u] = txt; });
    saveProgress(p);
    const tests = store.get(K.tests, []);
    (obj.tests || []).forEach(x => { if (!tests.some(y => y.date === x.date && y.score === x.score)) tests.push(x); });
    store.set(K.tests, tests);
  }
  if (obj.srs) {
    const srs = getSrs();
    Object.entries(obj.srs).forEach(([id, s]) => { if (!srs[id] || (s.reps || 0) > (srs[id].reps || 0)) srs[id] = s; });
    store.set(K.srs, srs);
  }
  if (obj.custom) {
    const custom = getCustom();
    obj.custom.forEach(c => { if (c && c.id && !custom.some(x => x.id === c.id)) custom.push(c); });
    store.set(K.custom, custom);
  }
}

$('resetBtn').onclick = () => showModal('resetModal');
$('resetConfirm').onclick = () => {
  Object.values(K).forEach(k => localStorage.removeItem(k));
  ['en_sync_url', 'en_timer', 'en_tests'].forEach(k => localStorage.removeItem(k));
  hideModal('resetModal'); toast('Datos eliminados'); renderAll();
};

let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('installBtn').hidden = false; });
$('installBtn').onclick = async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; $('installBtn').hidden = true; };
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// =====================================================================
// INIT
// =====================================================================
function renderPage(id) {
  if (id === 'pageHoy') renderToday();
  else if (id === 'pageCurso') renderCurso();
  else if (id === 'pageRepaso') renderRepaso();
  else if (id === 'pageProgreso') renderProgreso();
  else if (id === 'pageAjustes') renderAjustes();
}
function renderAll() { renderHeader(); renderStats(); renderPage(currentPage); }

document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !P) renderAll(); });
renderAll();
// Pide al navegador que no borre los datos de la app si falta espacio
if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(ok => { if (!ok) navigator.storage.persist(); }).catch(() => {});
