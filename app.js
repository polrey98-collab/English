'use strict';

// =====================================================================
// CONFIG
// =====================================================================
// kind: 'practice' = práctica activa · 'input' = exposición (escuchar/leer)
const TOOLS = [
  { id: 'italki',    name: 'italki',     icon: '🗣️', mins: 30, kind: 'practice' },
  { id: 'talkpal',   name: 'TalkPal',    icon: '🤖', mins: 15, kind: 'practice' },
  { id: 'repaso',    name: 'Repaso',     icon: '🃏', mins: 10, kind: 'practice' },
  { id: 'anki',      name: 'Anki',       icon: '🧠', mins: 10, kind: 'practice' },
  { id: 'shadowing', name: 'Shadowing',  icon: '🦜', mins: 10, kind: 'practice' },
  { id: 'selftalk',  name: 'Self-talk',  icon: '💭', mins: 5,  kind: 'practice' },
  { id: 'escritura', name: 'Escritura',  icon: '✍️', mins: 20, kind: 'practice' },
  { id: 'elsa',      name: 'ELSA',       icon: '🎙️', mins: 10, kind: 'practice' },
  { id: 'examen',    name: 'Examen C1',  icon: '🎓', mins: 30, kind: 'practice' },
  { id: 'podcast',   name: 'Podcast',    icon: '🎧', mins: 20, kind: 'input' },
  { id: 'lectura',   name: 'Lectura',    icon: '📖', mins: 20, kind: 'input' },
  { id: 'series',    name: 'Series',     icon: '📺', mins: 30, kind: 'input' },
  { id: 'drops',     name: 'Drops',      icon: '💧', mins: 5,  kind: 'practice', legacy: true },
];
const TOOL = Object.fromEntries(TOOLS.map(t => [t.id, t]));

const PHASES = [
  { n: 1, name: 'Consolidar B2',     from: 0,  to: 4,  goal: 'Entender sin esfuerzo contenido para estudiantes y eliminar tus errores típicos.',
    focus: ['Mucho input: podcasts, series y lectura', 'Falsos amigos y errores típicos (Repaso)', 'Gramática B2 sólida'] },
  { n: 2, name: 'B2+ → C1',          from: 4,  to: 10, goal: 'Hablar con fluidez de tu trabajo y tu vida sin traducir.',
    focus: ['Mucho output: italki, shadowing, self-talk', 'Escritura corregida cada semana', 'Collocations y phrasal verbs'] },
  { n: 3, name: 'C1 y certificado',  from: 10, to: 15, goal: 'Precisión, registro formal y formato de examen.',
    focus: ['Modelos de examen cronometrados', 'Gramática C1: inversión, cleft, condicionales mixtos', 'Writing: essay, report, proposal, review'] },
];

// Plan semanal por fase. Índice = día de la semana (0 = domingo).
const WEEKLY_PLANS = {
  1: { 1: ['italki', 'anki', 'podcast'], 2: ['shadowing', 'lectura', 'repaso'], 3: ['talkpal', 'anki', 'series'],
       4: ['italki', 'repaso', 'podcast'], 5: ['escritura', 'anki', 'selftalk'], 6: ['series', 'lectura'], 0: ['repaso'] },
  2: { 1: ['italki', 'anki', 'selftalk'], 2: ['shadowing', 'elsa', 'lectura'], 3: ['talkpal', 'repaso', 'podcast'],
       4: ['italki', 'escritura'], 5: ['shadowing', 'anki', 'series'], 6: ['series', 'lectura'], 0: ['repaso', 'selftalk'] },
  3: { 1: ['italki', 'anki'], 2: ['examen', 'repaso'], 3: ['talkpal', 'shadowing', 'podcast'],
       4: ['italki', 'escritura'], 5: ['examen', 'anki'], 6: ['lectura', 'series'], 0: ['repaso'] },
};

const DAY_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const INTERVALS = [0, 1, 2, 4, 8, 16, 32, 64]; // días por caja (Leitner)
const MASTERED_BOX = 5;
const SESSION_MAX = 25;
const TIMER_WARN_MIN = 30;

const K = {
  days: 'en_tracker', srs: 'en_srs', custom: 'en_custom', tests: 'en_tests',
  settings: 'en_settings', timer: 'en_timer', sync: 'en_sync_url',
};
const DEFAULT_SETTINGS = { startDate: null, phase: 'auto', goalPractice: 400, goalInput: 500, newPerDay: 8, voice: 'en-GB' };

// =====================================================================
// HELPERS
// =====================================================================
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = s => esc(s).replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
const plain = s => String(s ?? '').replace(/\*/g, '');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { toast('⚠️ No se pudo guardar'); } },
};

// Fechas locales (YYYY-MM-DD)
function keyOf(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function parseKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(k, n) { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); }
function todayKey() { return keyOf(new Date()); }
function diffDays(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
function mondayOf(k) { const d = parseKey(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return keyOf(d); }
function niceDate(k) { const d = parseKey(k); return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; }
function relDate(k) { const t = todayKey(); if (k === t) return 'Hoy'; if (k === addDays(t, -1)) return 'Ayer'; return niceDate(k); }
function hours(mins) { const h = mins / 60; return h >= 100 ? Math.round(h) : Math.round(h * 10) / 10; }
function dayIndex(k) { return Math.floor(parseKey(k).getTime() / 86400000); }

// =====================================================================
// DATA
// =====================================================================
function getSettings() {
  const s = { ...DEFAULT_SETTINGS, ...store.get(K.settings, {}) };
  if (!s.startDate) { s.startDate = todayKey(); store.set(K.settings, s); }
  return s;
}
function saveSettings(patch) { store.set(K.settings, { ...getSettings(), ...patch }); }

function getDays() { return store.get(K.days, {}); }
function normDay(d) {
  d = d || {};
  return {
    tools: Array.isArray(d.tools) ? d.tools.slice() : [],
    mins: (d.mins && typeof d.mins === 'object') ? { ...d.mins } : {},
    reviews: d.reviews || 0, newCards: d.newCards || 0, reviewSecs: d.reviewSecs || 0,
  };
}
function getDay(k) { return normDay(getDays()[k]); }
function saveDay(k, day) { const all = getDays(); all[k] = day; store.set(K.days, all); }
function toolMins(day, t) { const v = day.mins[t]; return typeof v === 'number' ? v : (TOOL[t]?.mins || 0); }
function dayMins(day, kind) {
  return day.tools.reduce((s, t) => s + ((!kind || TOOL[t]?.kind === kind) ? toolMins(day, t) : 0), 0);
}

function phaseFor(k) {
  const s = getSettings();
  if (s.phase !== 'auto') return PHASES[+s.phase - 1];
  const months = Math.max(0, diffDays(s.startDate, k)) / 30.44;
  return months < PHASES[0].to ? PHASES[0] : months < PHASES[1].to ? PHASES[1] : PHASES[2];
}
function planFor(k) { return WEEKLY_PLANS[phaseFor(k).n][parseKey(k).getDay()] || []; }

function getSrs() { return store.get(K.srs, {}); }
function getCustom() { return store.get(K.custom, []); }
function allCards() { return DECK.concat(getCustom().map(c => ({ ...c, cat: 'mine' }))); }
function cardById(id) { return allCards().find(c => c.id === id); }
function getTests() { return store.get(K.tests, []).slice().sort((a, b) => a.date.localeCompare(b.date)); }

// =====================================================================
// UI BASICS
// =====================================================================
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
function showModal(id) { $(id).classList.add('show'); }
function hideModal(id) { $(id).classList.remove('show'); }
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) hideModal(o.id); });
});
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

function speak(text) {
  if (!('speechSynthesis' in window)) { toast('Tu navegador no tiene voz'); return; }
  const s = getSettings();
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(plain(text).replace(/_{2,}/g, 'blank'));
  u.lang = s.voice;
  const v = speechSynthesis.getVoices().find(v => v.lang === s.voice) || speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));
  if (v) u.voice = v;
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

// =====================================================================
// HEADER + STREAKS
// =====================================================================
function renderHeader() {
  const t = todayKey(), d = parseKey(t), ph = phaseFor(t);
  $('headerDate').textContent = `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  $('phaseLabel').textContent = `Fase ${ph.n}: ${ph.name}`;
}

function renderStreaks() {
  const days = getDays();
  const active = k => days[k] && Array.isArray(days[k].tools) && days[k].tools.length > 0;
  let k = todayKey();
  if (!active(k)) k = addDays(k, -1); // hoy aún no cuenta si no has hecho nada
  let current = 0;
  while (active(k) && current < 5000) { current++; k = addDays(k, -1); }

  const keys = Object.keys(days).filter(active).sort();
  let best = 0, run = 0, prev = null, total = 0;
  keys.forEach(key => {
    run = (prev && diffDays(prev, key) === 1) ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
    total += dayMins(normDay(days[key]));
  });
  $('streakCurrent').textContent = current;
  $('streakBest').textContent = Math.max(best, current);
  $('totalHours').textContent = hours(total);
}

// =====================================================================
// HOY
// =====================================================================
function planRowsHTML(k, planned, day) {
  const isPast = k < todayKey();
  const all = [...new Set([...planned, ...day.tools])];
  return all.map(tid => {
    const t = TOOL[tid]; if (!t) return '';
    const done = day.tools.includes(tid), wasPlanned = planned.includes(tid);
    let st, label;
    if (done && wasPlanned) { st = 'done'; label = '✓ Hecho'; }
    else if (done) { st = 'extra'; label = 'Extra'; }
    else if (isPast) { st = 'missed'; label = 'No hecho'; }
    else { st = 'pending'; label = 'Pendiente'; }
    const mins = done ? toolMins(day, tid) : t.mins;
    return `<button type="button" class="plan-row" data-tool="${tid}" data-date="${k}">
      <div class="plan-dot ${st}"></div>
      <div class="plan-tool">${t.icon} ${esc(t.name)}</div>
      <div class="plan-time">${mins} min</div>
      <div class="plan-status ${st}">${label}</div>
    </button>`;
  }).join('');
}

function renderToday() {
  const k = todayKey(), day = getDay(k), planned = planFor(k);
  const plannedMins = planned.reduce((s, t) => s + TOOL[t].mins, 0);
  $('todayPlanMeta').textContent = `${dayMins(day)} / ${plannedMins} min`;
  $('todayPlan').innerHTML = planned.length || day.tools.length
    ? planRowsHTML(k, planned, day)
    : '<p class="muted small">Día libre: inmersión pasiva.</p>';

  // Tools grid
  $('toolsGrid').innerHTML = TOOLS.filter(t => !t.legacy || day.tools.includes(t.id)).map(t => {
    const done = day.tools.includes(t.id);
    return `<button type="button" class="tool-btn${done ? ' done' : ''}" data-tool="${t.id}" data-date="${k}">
      <span class="tool-icon">${t.icon}</span>
      <span class="tool-name">${esc(t.name)}</span>
      <span class="tool-time">${done ? toolMins(day, t.id) + ' min ✓' : t.mins + ' min'}</span>
      ${done ? '<div class="tool-check"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>' : ''}
    </button>`;
  }).join('');

  renderReviewTeaser();
  renderChallenge();
  renderPhraseOfDay();
}

function renderReviewTeaser() {
  const q = buildQueue('all');
  const day = getDay(todayKey());
  const pending = q.due.length + q.fresh.length;
  $('reviewMeta').textContent = day.reviews ? `${day.reviews} hechas hoy` : '';
  $('reviewTeaser').innerHTML = pending
    ? `<div class="teaser">
        <div class="teaser-num">${pending}</div>
        <div class="teaser-txt">${q.due.length} para repasar · ${q.fresh.length} nuevas<br>≈ ${Math.max(2, Math.round(pending * 0.4))} min · falsos amigos, errores, collocations…</div>
        <button type="button" class="btn primary" id="goReview">Empezar</button>
      </div>`
    : `<div class="teaser"><div class="teaser-num">✓</div><div class="teaser-txt">Todo repasado por hoy. Vuelve mañana o añade tus propias frases.</div>
        <button type="button" class="btn" id="goReview">Ver</button></div>`;
  $('goReview').onclick = () => switchPage('pageRepaso');
}

// ---------- Reto del día ----------
let challengeTab = 'speak';
const challengeOffset = { speak: 0, self: 0, write: 0 };

function challengeItem(tab) {
  const n = dayIndex(todayKey()) + challengeOffset[tab];
  if (tab === 'speak') return SPEAKING_TOPICS[n % SPEAKING_TOPICS.length];
  if (tab === 'self') return SELFTALK_MISSIONS[n % SELFTALK_MISSIONS.length];
  const ph = phaseFor(todayKey()).n;
  const list = WRITING_TASKS.filter(w => w.level <= ph);
  return list[n % list.length];
}

function renderChallenge() {
  document.querySelectorAll('#challengeTabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === challengeTab));
  const it = challengeItem(challengeTab);
  let html, tool;
  if (challengeTab === 'speak') {
    tool = 'selftalk';
    html = `<div class="challenge-text">${esc(it)}</div>
      <div class="challenge-how"><strong>Técnica 4/3/2:</strong> grábate hablando 4 min sobre el tema, luego cuéntalo otra vez en 3 min y por último en 2. Cada vuelta sale más fluida. Escucha la última grabación y anota 1–2 errores en "Mis frases".</div>`;
  } else if (challengeTab === 'self') {
    tool = 'selftalk';
    html = `<div class="challenge-text">${esc(it)}</div>
      <div class="challenge-how"><strong>Regla:</strong> nada de traducir. Si te falta una palabra, descríbela (<em>"the thing you use to…"</em>). Después busca 1 palabra que te faltó en un diccionario inglés–inglés.</div>`;
  } else {
    tool = 'escritura';
    html = `<div class="challenge-text">${esc(it.text)}</div>
      <div class="challenge-how"><strong>~${it.words} palabras, sin traductor.</strong> Después pide corrección: <em>"Correct my text, explain each mistake briefly and rewrite it at C1 level."</em></div>`;
  }
  html += `<div class="challenge-actions">
    <button type="button" class="btn" id="chSpeak">🔊 Escuchar</button>
    <button type="button" class="btn primary" data-tool="${tool}" data-date="${todayKey()}">Registrar ✓</button>
  </div>`;
  $('challengeBody').innerHTML = html;
  $('chSpeak').onclick = () => speak(challengeTab === 'write' ? it.text : it);
}
$('challengeTabs').addEventListener('click', e => {
  const b = e.target.closest('button[data-tab]'); if (!b) return;
  challengeTab = b.dataset.tab; renderChallenge();
});
$('challengeNext').addEventListener('click', () => { challengeOffset[challengeTab]++; renderChallenge(); });

// ---------- Frase del día ----------
function renderPhraseOfDay() {
  const pool = DECK.filter(c => c.cat !== 'ff' && c.cat !== 'err');
  const c = pool[(dayIndex(todayKey()) * 7) % pool.length];
  const cat = CATEGORIES.find(x => x.id === c.cat);
  $('phraseOfDay').innerHTML = `
    <div class="pod-q">${cat.icon} ${esc(cat.name)} · ${esc(c.q || Q[c.cat])}</div>
    <div class="pod-front">${fmt(c.front)}</div>
    <div class="pod-back" id="podBack" hidden>${fmt(c.back)}${c.note ? `<div class="study-note">${fmt(c.note)}</div>` : ''}</div>
    <div class="challenge-actions">
      <button type="button" class="btn" id="podReveal">Ver respuesta</button>
      <button type="button" class="btn" id="podSpeak">🔊</button>
    </div>`;
  $('podReveal').onclick = () => { $('podBack').hidden = false; $('podReveal').hidden = true; };
  $('podSpeak').onclick = () => speak($('podBack').hidden ? c.front : c.back);
}

// =====================================================================
// LOG MODAL + TIMER
// =====================================================================
let logCtx = null; // { tool, date, mins }
const MIN_CHIPS = [5, 10, 15, 20, 30, 45, 60];

function openLog(tool, date) {
  const t = TOOL[tool]; if (!t) return;
  const day = getDay(date);
  const done = day.tools.includes(tool);
  logCtx = { tool, date, mins: done ? toolMins(day, tool) : t.mins, done };
  $('logIcon').textContent = t.icon;
  $('logTitle').textContent = t.name;
  $('logDate').textContent = (relDate(date)) + (done ? ' · ya registrado' : '');
  $('logGuide').textContent = TOOL_GUIDES[tool] || '';
  $('logGuide').hidden = !TOOL_GUIDES[tool];
  $('logRemove').hidden = !done;
  renderLogMins();
  renderTimerBox();
  showModal('logModal');
}
function renderLogMins() {
  $('logMins').textContent = logCtx.mins;
  $('logChips').innerHTML = MIN_CHIPS.map(m => `<button type="button" class="chip${m === logCtx.mins ? ' active' : ''}" data-m="${m}">${m}</button>`).join('');
}
$('logChips').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (!b) return; logCtx.mins = +b.dataset.m; renderLogMins(); });
$('logMinus').onclick = () => { logCtx.mins = clamp(logCtx.mins - 5, 1, 600); renderLogMins(); };
$('logPlus').onclick = () => { logCtx.mins = clamp(logCtx.mins + 5, 1, 600); renderLogMins(); };
$('logCancel').onclick = () => hideModal('logModal');
$('logSave').onclick = () => { setToolMins(logCtx.date, logCtx.tool, logCtx.mins); hideModal('logModal'); toast(`${TOOL[logCtx.tool].icon} ${logCtx.mins} min registrados`); };
$('logRemove').onclick = () => { removeTool(logCtx.date, logCtx.tool); hideModal('logModal'); toast('Actividad quitada'); };

function setToolMins(date, tool, mins) {
  const day = getDay(date);
  if (!day.tools.includes(tool)) day.tools.push(tool);
  day.mins[tool] = mins;
  if (tool === 'repaso') day.reviewSecs = mins * 60;
  saveDay(date, day);
  syncToSheet(date, day);
  renderAfterLog();
}
function removeTool(date, tool) {
  const day = getDay(date);
  day.tools = day.tools.filter(t => t !== tool);
  delete day.mins[tool];
  if (tool === 'repaso') day.reviewSecs = 0;
  saveDay(date, day);
  syncToSheet(date, day);
  renderAfterLog();
}
function renderAfterLog() { renderStreaks(); renderPage(currentPage); }

// Delegación: cualquier elemento con data-tool abre el registro
document.addEventListener('click', e => {
  const el = e.target.closest('[data-tool][data-date]');
  if (el) openLog(el.dataset.tool, el.dataset.date);
});

// ---------- Timer (sobrevive a recargas) ----------
function getTimer() { return store.get(K.timer, null); }
function timerElapsed(tm) { return Math.floor((Date.now() - tm.start) / 1000); }
function mmss(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

function renderTimerBox() {
  if (!logCtx) return;
  const tm = getTimer();
  const box = $('timerBox');
  if (tm && tm.tool === logCtx.tool && tm.date === logCtx.date) {
    box.innerHTML = `<div class="t" id="timerBoxT">${mmss(timerElapsed(tm))}<small>cronometrando…</small></div>
      <button type="button" class="btn primary" id="timerStop">⏹ Parar y guardar</button>`;
    $('timerStop').onclick = stopTimer;
  } else if (tm) {
    box.innerHTML = `<div class="t" style="font-size:13px;font-weight:600">⏱ Ya hay un temporizador en marcha (${esc(TOOL[tm.tool]?.name)}).</div>`;
  } else if (logCtx.date === todayKey()) {
    box.innerHTML = `<div class="t" style="font-size:13px;font-weight:600">¿Empiezas ahora?<small>Te aviso a los ${TIMER_WARN_MIN} min para descansar</small></div>
      <button type="button" class="btn" id="timerStart">▶ Temporizador</button>`;
    $('timerStart').onclick = startTimer;
  } else {
    box.innerHTML = '';
  }
  box.hidden = !box.innerHTML;
}
function startTimer() {
  store.set(K.timer, { tool: logCtx.tool, date: logCtx.date, start: Date.now(), warned: false });
  hideModal('logModal');
  toast(`⏱ ${TOOL[logCtx.tool].name} en marcha. ¡A por ello!`);
  tickTimer();
}
function stopTimer() {
  const tm = getTimer(); if (!tm) return;
  const mins = Math.max(1, Math.round(timerElapsed(tm) / 60));
  const day = getDay(tm.date);
  const prev = day.tools.includes(tm.tool) ? toolMins(day, tm.tool) : 0;
  localStorage.removeItem(K.timer);
  setToolMins(tm.date, tm.tool, prev + mins);
  hideModal('logModal');
  tickTimer();
  toast(`✓ ${mins} min de ${TOOL[tm.tool].name} guardados`);
}
function tickTimer() {
  const tm = getTimer(), pill = $('timerPill');
  if (!tm) { pill.hidden = true; return; }
  const s = timerElapsed(tm);
  pill.hidden = false;
  pill.textContent = `${TOOL[tm.tool]?.icon || '⏱'} ${mmss(s)}`;
  pill.classList.toggle('warn', s >= TIMER_WARN_MIN * 60);
  if (s >= TIMER_WARN_MIN * 60 && !tm.warned) {
    tm.warned = true; store.set(K.timer, tm);
    toast(`⏰ ${TIMER_WARN_MIN} min: toca descanso o cambiar de actividad`);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
  const t = $('timerBoxT');
  if (t) t.firstChild.textContent = mmss(s);
}
$('timerPill').onclick = () => { const tm = getTimer(); if (tm) openLog(tm.tool, tm.date); };
setInterval(tickTimer, 1000);

// =====================================================================
// REPASO (repetición espaciada tipo Leitner)
// =====================================================================
let studyCat = 'all';
let session = null;

function orderedNew(cards, srs, cat) {
  const fresh = cards.filter(c => !srs[c.id] && c.cat !== 'mine');
  if (cat !== 'all') return fresh;
  // Intercala categorías para que cada sesión sea variada
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
  const fresh = orderedNew(cards, srs, cat).slice(0, newLeft);
  return { due, fresh };
}

function startSession(extraNew) {
  let { due, fresh } = buildQueue(studyCat);
  if (extraNew) fresh = orderedNew(allCards().filter(c => studyCat === 'all' || c.cat === studyCat), getSrs(), studyCat).slice(0, extraNew);
  const queue = [...due, ...fresh].slice(0, SESSION_MAX).map(c => c.id);
  session = { queue, idx: 0, revealed: false, ok: 0, done: 0, failed: new Set(), lastTs: Date.now(), extra: !!extraNew };
  renderStudy();
}

function renderCatChips() {
  const t = todayKey(), srs = getSrs(), cards = allCards();
  const dueCount = cat => cards.filter(c => (cat === 'all' || c.cat === cat) && srs[c.id] && srs[c.id].due <= t).length;
  const chips = [{ id: 'all', name: 'Todo', icon: '✨' }, ...CATEGORIES];
  $('catChips').innerHTML = chips.map(c => {
    const n = dueCount(c.id);
    return `<button type="button" class="chip${studyCat === c.id ? ' active' : ''}" data-cat="${c.id}">${c.icon} ${esc(c.name)}${n ? `<span class="count">${n}</span>` : ''}</button>`;
  }).join('');
}
$('catChips').addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if (!b) return;
  studyCat = b.dataset.cat; renderCatChips(); startSession();
});

function renderStudy() {
  const area = $('studyArea');
  if (!session) startSession();
  const { queue, idx } = session;

  if (idx >= queue.length) {
    const more = orderedNew(allCards().filter(c => studyCat === 'all' || c.cat === studyCat), getSrs(), studyCat).length;
    const pct = session.done ? Math.round(session.ok / session.done * 100) : 0;
    area.innerHTML = `<div class="study-empty">
      <div class="big">${session.done ? '🎉' : '✅'}</div>
      <h3>${session.done ? `¡Sesión completada!` : 'Nada pendiente aquí'}</h3>
      <p>${session.done ? `${session.done} tarjetas · ${pct}% a la primera.<br>` : ''}Las tarjetas vuelven justo cuando estás a punto de olvidarlas.</p>
      ${more ? `<button type="button" class="btn primary" id="moreNew">+5 nuevas</button>` : ''}
      <button type="button" class="btn" id="backHome">Volver a Hoy</button>
    </div>`;
    if (more) $('moreNew').onclick = () => startSession(5);
    $('backHome').onclick = () => switchPage('pageHoy');
    return;
  }

  const c = cardById(queue[idx]);
  if (!c) { session.idx++; return renderStudy(); }
  const cat = CATEGORIES.find(x => x.id === c.cat);
  const isNew = !getSrs()[c.id];
  const q = c.q || Q[c.cat] || 'Recall the correct version.';
  area.innerHTML = `
    <div class="study-top">
      <div><span class="tag">${cat.icon} ${esc(cat.name)}</span>${isNew ? '<span class="tag new">NEW</span>' : ''}</div>
      <div class="card-meta">${idx + 1} / ${queue.length}</div>
    </div>
    <div class="progress"><div style="width:${(idx / queue.length) * 100}%"></div></div>
    <div class="study-q">${esc(q)}</div>
    <div class="study-front"><span>${fmt(c.front)}</span><button type="button" class="speak" data-say="front" aria-label="Escuchar">🔊</button></div>
    ${session.revealed ? `
      <div class="study-back"><span>${fmt(c.back)}</span><button type="button" class="speak" data-say="back" aria-label="Escuchar">🔊</button></div>
      ${c.note ? `<div class="study-note">${fmt(c.note)}</div>` : ''}` : ''}
    <div class="study-spacer"></div>
    ${session.revealed ? `
      <div class="study-actions">
        <button type="button" class="btn grade-no" data-grade="no">✗ No</button>
        <button type="button" class="btn grade-meh" data-grade="meh">~ Casi</button>
        <button type="button" class="btn grade-yes" data-grade="yes">✓ Sí</button>
      </div>` : `
      <div class="study-actions"><button type="button" class="btn primary" id="reveal">Mostrar respuesta</button></div>`}
    <div class="kbd-hint">Dilo en voz alta antes de girar · PC: espacio = girar, 1/2/3 = No/Casi/Sí</div>`;
  area.querySelectorAll('[data-say]').forEach(b => b.onclick = () => speak(b.dataset.say === 'front' ? c.front : c.back));
  if (!session.revealed) $('reveal').onclick = reveal;
  area.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => grade(b.dataset.grade));
}
function reveal() { session.revealed = true; renderStudy(); }

function grade(g) {
  const t = todayKey();
  const id = session.queue[session.idx];
  const srs = getSrs();
  const isNew = !srs[id];
  const s = srs[id] || { box: 0, reps: 0, lapses: 0 };
  const firstTimeToday = !session.failed.has(id); // aún no fallada en esta sesión

  if (g === 'no') {
    s.box = 1; s.lapses++; s.due = addDays(t, 1);
    if (firstTimeToday) { session.failed.add(id); session.queue.push(id); } // vuelve al final
  } else if (g === 'meh') {
    s.box = Math.max(1, s.box);
    s.due = addDays(t, Math.max(1, Math.round(INTERVALS[s.box] / 2)));
  } else {
    s.box = session.failed.has(id) ? 1 : Math.min(s.box + 1, INTERVALS.length - 1);
    s.due = addDays(t, INTERVALS[s.box]);
  }
  s.reps++; s.seen = t;
  srs[id] = s;
  store.set(K.srs, srs);

  if (firstTimeToday) { session.done++; if (g === 'yes') session.ok++; }

  // Registro automático del tiempo de repaso
  const now = Date.now();
  const day = getDay(t);
  day.reviews++;
  if (isNew && !session.extra) day.newCards++;
  day.reviewSecs += Math.min(120, Math.round((now - session.lastTs) / 1000));
  session.lastTs = now;
  if (!day.tools.includes('repaso')) day.tools.push('repaso');
  day.mins.repaso = Math.max(1, Math.round(day.reviewSecs / 60));
  saveDay(t, day);

  session.idx++;
  session.revealed = false;
  if (session.idx >= session.queue.length) { syncToSheet(t, day); renderStreaks(); renderCatChips(); }
  renderStudy();
}

document.addEventListener('keydown', e => {
  if (currentPage !== 'pageRepaso' || !session || session.idx >= session.queue.length) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
  if (document.querySelector('.modal-overlay.show')) return;
  if (e.code === 'Space' && !session.revealed) { e.preventDefault(); reveal(); }
  else if (session.revealed && ['1', '2', '3'].includes(e.key)) grade({ 1: 'no', 2: 'meh', 3: 'yes' }[e.key]);
});

// ---------- Mis frases ----------
$('mineForm').addEventListener('submit', e => {
  e.preventDefault();
  const front = $('mineFront').value.trim(), back = $('mineBack').value.trim(), note = $('mineNote').value.trim();
  if (!front || !back) return;
  const id = 'u' + Date.now().toString(36);
  const custom = getCustom();
  custom.push({ id, front, back, note, q: 'Recall the correct / natural version.', created: todayKey() });
  store.set(K.custom, custom);
  const srs = getSrs();
  srs[id] = { box: 0, reps: 0, lapses: 0, due: todayKey() };
  store.set(K.srs, srs);
  e.target.reset();
  toast('📝 Añadida al repaso');
  renderMine(); renderCatChips();
  if (session && session.idx >= session.queue.length) startSession();
});
function renderMine() {
  const custom = getCustom();
  $('mineCount').textContent = custom.length ? `${custom.length} frases` : '';
  $('mineList').innerHTML = custom.slice().reverse().map(c => `
    <div class="mine-item">
      <div><div class="wrong">${esc(c.front)}</div><div class="right">${esc(c.back)}</div>${c.note ? `<div class="muted small">${esc(c.note)}</div>` : ''}</div>
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

function renderRepaso() {
  renderCatChips();
  if (!session || session.idx >= session.queue.length) startSession(); else renderStudy();
  renderMine();
}

// =====================================================================
// PROGRESO
// =====================================================================
let weekOffset = 0;
let selectedDay = null;

function totals() {
  const days = getDays();
  const byTool = {}; let practice = 0, input = 0;
  Object.values(days).forEach(raw => {
    const d = normDay(raw);
    d.tools.forEach(t => {
      const m = toolMins(d, t);
      byTool[t] = (byTool[t] || 0) + m;
      if (TOOL[t]?.kind === 'input') input += m; else practice += m;
    });
  });
  return { byTool, practice, input };
}

function renderGoals() {
  const s = getSettings(), tt = totals(), t = todayKey();
  const pP = clamp(tt.practice / 60 / s.goalPractice * 100, 0, 100);
  const pI = clamp(tt.input / 60 / s.goalInput * 100, 0, 100);
  $('goalBars').innerHTML = `
    <div class="goal"><div class="goal-top"><span>🏋️ Práctica activa</span><span>${hours(tt.practice)} / ${s.goalPractice} h</span></div>
      <div class="bar"><div style="width:${pP}%"></div></div></div>
    <div class="goal"><div class="goal-top"><span>🎧 Input (escuchar y leer)</span><span>${hours(tt.input)} / ${s.goalInput} h</span></div>
      <div class="bar green"><div style="width:${pI}%"></div></div></div>`;

  // Fases
  const months = Math.max(0, diffDays(s.startDate, t)) / 30.44;
  const cur = phaseFor(t).n;
  $('phaseTrack').innerHTML = `
    <div class="phase-track">${PHASES.map(p => {
      const w = p.to - p.from;
      const fill = s.phase === 'auto' ? clamp((months - p.from) / w, 0, 1) : (p.n < cur ? 1 : p.n === cur ? 0.5 : 0);
      return `<div class="phase-seg" style="flex:${w}"><div style="transform:scaleX(${fill})"></div></div>`;
    }).join('')}</div>
    <div class="phase-labels">${PHASES.map(p => `<div style="flex:${p.to - p.from}" class="${p.n === cur ? 'cur' : ''}">${p.n}. ${esc(p.name)}</div>`).join('')}</div>`;

  // Estimación (ritmo de los últimos 28 días)
  const days = getDays();
  let last28 = 0;
  for (let i = 0; i < 28; i++) last28 += dayMins(normDay(days[addDays(t, -i)]), 'practice');
  const perDay = last28 / 28;
  const remaining = s.goalPractice * 60 - tt.practice;
  let eta;
  if (remaining <= 0) eta = '🎉 <strong>¡Objetivo de práctica alcanzado!</strong> Es momento de presentarte al examen.';
  else if (perDay < 1) eta = 'Registra actividad unos días y aquí verás tu <strong>fecha estimada</strong> para el objetivo.';
  else {
    const d = parseKey(addDays(t, Math.ceil(remaining / perDay)));
    eta = `A tu ritmo actual (<strong>${Math.round(perDay)} min/día</strong> de práctica en los últimos 28 días) llegarás al objetivo en <strong>${MONTHS[d.getMonth()]} ${d.getFullYear()}</strong>.${perDay < 40 ? ' Con 45 min/día irías bastante más rápido.' : ''}`;
  }
  $('eta').innerHTML = eta;
}

function renderWeek() {
  const t = todayKey();
  const monday = addDays(mondayOf(t), weekOffset * 7);
  if (!selectedDay || mondayOf(selectedDay) !== monday) selectedDay = weekOffset === 0 ? t : monday;
  let mins = 0, planned = 0, done = 0;
  $('weekGrid').innerHTML = Array.from({ length: 7 }, (_, i) => {
    const k = addDays(monday, i), d = getDay(k), m = dayMins(d);
    mins += m;
    if (k <= t) { const p = planFor(k); planned += p.length; done += p.filter(x => d.tools.includes(x)).length; }
    const cls = ['week-day', m ? 'has-data' : '', k === t ? 'today' : '', k === selectedDay ? 'selected' : '', k > t ? 'future' : ''].join(' ');
    return `<button type="button" class="${cls}" data-day="${k}">
      <div class="week-day-name">${DAY_SHORT[parseKey(k).getDay()]}</div>
      <div class="week-day-num">${parseKey(k).getDate()}</div>
      <div class="week-day-mins">${m ? m + '′' : ''}</div></button>`;
  }).join('');
  const pct = planned ? Math.round(done / planned * 100) : 0;
  $('weekSummary').innerHTML = `
    <div><b>${hours(mins)} h</b><span>esta semana</span></div>
    <div><b>${pct}%</b><span>del plan</span></div>
    <div><b>${Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter(k => getDay(k).tools.length).length}/7</b><span>días activos</span></div>`;
  $('weekNext').disabled = weekOffset >= 0;
  $('weekNext').style.opacity = weekOffset >= 0 ? .3 : 1;
  renderDayDetail();
}
$('weekGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-day]'); if (!b) return;
  selectedDay = b.dataset.day; renderWeek();
});
$('weekPrev').onclick = () => { weekOffset--; selectedDay = null; renderWeek(); };
$('weekNext').onclick = () => { if (weekOffset < 0) { weekOffset++; selectedDay = null; renderWeek(); } };

function renderDayDetail() {
  const k = selectedDay;
  if (k > todayKey()) {
    const p = planFor(k);
    $('dayDetail').innerHTML = `<div class="day-title">${niceDate(k)} · plan</div>` +
      (p.length ? p.map(t => `<div class="plan-row" style="cursor:default"><div class="plan-dot missed"></div><div class="plan-tool">${TOOL[t].icon} ${esc(TOOL[t].name)}</div><div class="plan-time">${TOOL[t].mins} min</div></div>`).join('') : '<p class="muted small">Día libre</p>');
    return;
  }
  const d = getDay(k), p = planFor(k);
  const others = TOOLS.filter(t => !t.legacy && !d.tools.includes(t.id) && !p.includes(t.id));
  $('dayDetail').innerHTML = `<div class="day-title">${relDate(k)} · ${dayMins(d)} min${d.reviews ? ` · ${d.reviews} tarjetas` : ''}</div>
    ${planRowsHTML(k, p, d) || '<p class="muted small">Día libre</p>'}
    <div class="add-label">Añadir a este día:</div>
    <div class="chips">${others.map(t => `<button type="button" class="chip" data-tool="${t.id}" data-date="${k}">${t.icon} ${esc(t.name)}</button>`).join('')}</div>`;
}

const cefrOf = s => s >= 71 ? 'C2' : s >= 61 ? 'C1' : s >= 51 ? 'B2' : s >= 41 ? 'B1' : s >= 31 ? 'A2' : 'A1';

function renderTests() {
  const tests = getTests();
  let html = tests.slice().reverse().map((x, i, arr) => {
    const prev = arr[i + 1];
    const delta = prev ? x.score - prev.score : null;
    const lvl = cefrOf(x.score);
    return `<div class="test-row">
      <div class="score">${x.score}</div>
      <div class="info"><div>${niceDate(x.date)} ${parseKey(x.date).getFullYear()}</div>${x.note ? `<div class="muted small">${esc(x.note)}</div>` : ''}</div>
      ${delta !== null ? `<div class="delta ${delta >= 0 ? 'up' : 'down'}">${delta >= 0 ? '+' : ''}${delta}</div>` : ''}
      <span class="cefr ${lvl.toLowerCase()}">${lvl}</span>
      <button type="button" class="del" data-deltest="${esc(x.date)}|${x.score}" aria-label="Borrar" style="border:none;background:none;color:var(--text-3);font-size:18px;cursor:pointer">×</button>
    </div>`;
  }).join('');
  if (!tests.length) html = '<p class="small" style="margin-top:4px"><strong>Haz tu primer test hoy</strong> para saber desde dónde partes. C1 = 61–70 en el EF SET.</p>';
  else {
    const next = addDays(tests[tests.length - 1].date, 90);
    const left = diffDays(todayKey(), next);
    html += `<div class="next-test">${left <= 0 ? '📅 <strong>Toca hacer un nuevo test.</strong>' : `📅 Próximo test en ${left} días (${niceDate(next)}).`}</div>`;
  }
  $('testsList').innerHTML = html;
}
$('testsList').addEventListener('click', e => {
  const b = e.target.closest('[data-deltest]'); if (!b) return;
  if (!confirm('¿Borrar este resultado?')) return;
  const [date, score] = b.dataset.deltest.split('|');
  const tests = store.get(K.tests, []);
  const i = tests.findIndex(x => x.date === date && String(x.score) === score);
  if (i >= 0) tests.splice(i, 1);
  store.set(K.tests, tests);
  renderTests();
});
$('addTestBtn').onclick = () => { $('testForm').reset(); $('testDate').value = todayKey(); showModal('testModal'); };
$('testForm').addEventListener('submit', e => {
  e.preventDefault();
  const score = clamp(parseInt($('testScore').value, 10) || 0, 0, 100);
  const tests = store.get(K.tests, []);
  tests.push({ date: $('testDate').value || todayKey(), score, note: $('testNote').value.trim() });
  store.set(K.tests, tests);
  hideModal('testModal');
  toast(`Guardado: ${score} → ${cefrOf(score)}`);
  renderTests();
});

function renderDeckStats() {
  const srs = getSrs(), cards = allCards(), t = todayKey(), days = getDays();
  let mastered = 0, learning = 0;
  cards.forEach(c => { const s = srs[c.id]; if (!s || !s.reps) return; if (s.box >= MASTERED_BOX) mastered++; else learning++; });
  let week = 0;
  for (let i = 0; i < 7; i++) week += normDay(days[addDays(t, -i)]).reviews;
  const fresh = cards.length - mastered - learning;
  $('deckStats').innerHTML = `
    <div class="stat-box"><div class="stat-box-num" style="color:var(--green)">${mastered}</div><div class="stat-box-label">Dominadas</div></div>
    <div class="stat-box"><div class="stat-box-num" style="color:var(--amber)">${learning}</div><div class="stat-box-label">Aprendiendo</div></div>
    <div class="stat-box"><div class="stat-box-num">${fresh}</div><div class="stat-box-label">Por ver</div></div>
    <div class="stat-box"><div class="stat-box-num" style="color:var(--accent)">${week}</div><div class="stat-box-label">Repasos · 7 días</div></div>`;
}

function renderToolBars() {
  const { byTool } = totals();
  const rows = Object.entries(byTool).filter(([t, m]) => TOOL[t] && m > 0).sort((a, b) => b[1] - a[1]);
  const max = rows.length ? rows[0][1] : 1;
  $('toolBars').innerHTML = rows.length ? rows.map(([t, m]) => `
    <div class="bar-row"><div class="name">${TOOL[t].icon} ${esc(TOOL[t].name)}</div>
      <div class="bar ${TOOL[t].kind}"><div style="width:${m / max * 100}%"></div></div>
      <div class="val">${m >= 60 ? hours(m) + ' h' : m + ' min'}</div></div>`).join('')
    : '<p class="muted small">Aún no hay actividad registrada.</p>';
}

function renderHeatmap() {
  const t = todayKey();
  const start = addDays(mondayOf(t), -15 * 7);
  let html = '';
  for (let i = 0; i < 16 * 7; i++) {
    const k = addDays(start, i);
    if (k > t) { html += '<div class="heat-cell future"></div>'; continue; }
    const m = dayMins(getDay(k));
    const l = m === 0 ? '' : m < 15 ? 'l1' : m < 30 ? 'l2' : m < 60 ? 'l3' : 'l4';
    html += `<div class="heat-cell ${l}" title="${k}: ${m} min"></div>`;
  }
  $('heatmap').innerHTML = html;
}

function renderProgreso() {
  renderGoals(); renderWeek(); renderTests(); renderDeckStats(); renderToolBars(); renderHeatmap();
}

// =====================================================================
// PLAN
// =====================================================================
function renderPlan() {
  const t = todayKey(), cur = phaseFor(t);
  $('phaseList').innerHTML = PHASES.map(p => `
    <div class="phase-item${p.n === cur.n ? ' cur' : ''}">
      <h4>${p.n}. ${esc(p.name)} <span>${p.n === cur.n ? '← estás aquí' : `meses ${p.from + 1}–${p.to}`}</span></h4>
      <p>${esc(p.goal)}</p>
      <ul>${p.focus.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    </div>`).join('');
  $('weekPlanTitle').textContent = `Tu semana · fase ${cur.n}`;
  const dow = parseKey(t).getDay();
  $('weekPlanTable').innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const tools = WEEKLY_PLANS[cur.n][d] || [];
    const m = tools.reduce((s, x) => s + TOOL[x].mins, 0);
    return `<div class="wp-row${d === dow ? ' today' : ''}"><div class="wp-day">${DAY_SHORT[d]}</div>
      <div class="wp-tools">${tools.map(x => `<span class="wp-tool">${TOOL[x].icon} ${esc(TOOL[x].name)}</span>`).join('')}</div>
      <div class="wp-min">${m} min</div></div>`;
  }).join('');
  $('toolGuides').innerHTML = TOOLS.filter(x => !x.legacy).map(x => `
    <div class="guide-item"><strong>${x.icon} ${esc(x.name)} · ${x.mins} min</strong>${esc(TOOL_GUIDES[x.id] || '')}</div>`).join('');
}

// =====================================================================
// AJUSTES
// =====================================================================
function renderAjustes() {
  const s = getSettings();
  $('setStart').value = s.startDate;
  $('setPhase').value = s.phase;
  $('setGoalPractice').value = s.goalPractice;
  $('setGoalInput').value = s.goalInput;
  $('setNewPerDay').value = s.newPerDay;
  $('setVoice').value = s.voice;
}
function bindSetting(id, key, parse) {
  $(id).addEventListener('change', e => {
    const v = parse(e.target.value);
    if (v === null) { renderAjustes(); return; }
    saveSettings({ [key]: v });
    renderHeader();
    toast('Ajuste guardado ✓');
  });
}
bindSetting('setStart', 'startDate', v => /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
bindSetting('setPhase', 'phase', v => v);
bindSetting('setGoalPractice', 'goalPractice', v => { const n = parseInt(v, 10); return n > 0 ? n : null; });
bindSetting('setGoalInput', 'goalInput', v => { const n = parseInt(v, 10); return n > 0 ? n : null; });
bindSetting('setNewPerDay', 'newPerDay', v => { const n = parseInt(v, 10); return n > 0 ? clamp(n, 3, 20) : null; });
bindSetting('setVoice', 'voice', v => v);

// ---------- Export / Import ----------
function exportAll() {
  return {
    app: 'en-tracker', version: 2, exported: new Date().toISOString(),
    days: getDays(), srs: getSrs(), custom: getCustom(), tests: store.get(K.tests, []), settings: store.get(K.settings, {}),
  };
}
$('exportBtn').onclick = () => {
  const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `en_tracker_${todayKey()}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const v2 = obj.version === 2 && obj.days;
  const inDays = v2 ? obj.days : obj; // formato antiguo = solo días

  // Días: unión de actividades, máximo de minutos
  const days = getDays();
  Object.entries(inDays).forEach(([k, raw]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
    const a = normDay(days[k]), b = normDay(raw);
    const tools = [...new Set([...a.tools, ...b.tools])];
    const mins = {};
    tools.forEach(t => { mins[t] = Math.max(a.tools.includes(t) ? toolMins(a, t) : 0, b.tools.includes(t) ? toolMins(b, t) : 0); });
    days[k] = { tools, mins, reviews: Math.max(a.reviews, b.reviews), newCards: Math.max(a.newCards, b.newCards), reviewSecs: Math.max(a.reviewSecs, b.reviewSecs) };
  });
  store.set(K.days, days);
  if (!v2) return;

  // Tarjetas: gana la que tenga más repasos
  const srs = getSrs();
  Object.entries(obj.srs || {}).forEach(([id, s]) => { if (!srs[id] || (s.reps || 0) > (srs[id].reps || 0)) srs[id] = s; });
  store.set(K.srs, srs);

  const custom = getCustom();
  (obj.custom || []).forEach(c => { if (c && c.id && !custom.some(x => x.id === c.id)) custom.push(c); });
  store.set(K.custom, custom);

  const tests = store.get(K.tests, []);
  (obj.tests || []).forEach(x => { if (!tests.some(y => y.date === x.date && y.score === x.score)) tests.push(x); });
  store.set(K.tests, tests);

  const cur = store.get(K.settings, {});
  store.set(K.settings, { ...(obj.settings || {}), ...cur, startDate: [cur.startDate, obj.settings?.startDate].filter(Boolean).sort()[0] || null });
}

// ---------- Google Sheets ----------
function getSyncUrl() { return localStorage.getItem(K.sync) || ''; }
async function syncToSheet(date, day) {
  const url = getSyncUrl(); if (!url) return;
  try {
    await fetch(url, {
      method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ date, tools: day.tools, mins: day.mins, totalMins: dayMins(day), reviews: day.reviews, timestamp: new Date().toISOString() }),
    });
  } catch (e) { console.warn('Sync failed:', e); }
}
$('syncBtn').onclick = () => { $('syncUrl').value = getSyncUrl(); showModal('syncModal'); };
$('syncSave').onclick = () => {
  const url = $('syncUrl').value.trim();
  if (url) localStorage.setItem(K.sync, url); else localStorage.removeItem(K.sync);
  hideModal('syncModal');
  toast(url ? 'Sync configurado ✓' : 'Sync desactivado');
};

// ---------- Reset ----------
$('resetBtn').onclick = () => showModal('resetModal');
$('resetConfirm').onclick = () => {
  Object.values(K).forEach(k => localStorage.removeItem(k));
  session = null;
  hideModal('resetModal');
  toast('Datos eliminados');
  renderAll();
};

// ---------- Instalar (PWA) ----------
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('installBtn').hidden = false; });
$('installBtn').onclick = async () => {
  if (!installEvt) return;
  installEvt.prompt();
  await installEvt.userChoice;
  installEvt = null; $('installBtn').hidden = true;
};
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// =====================================================================
// INIT
// =====================================================================
function renderPage(id) {
  if (id === 'pageHoy') renderToday();
  else if (id === 'pageRepaso') renderRepaso();
  else if (id === 'pageProgreso') renderProgreso();
  else if (id === 'pagePlan') renderPlan();
  else if (id === 'pageAjustes') renderAjustes();
}
function renderAll() { renderHeader(); renderStreaks(); renderPage(currentPage); tickTimer(); }

// Si la app se queda abierta y cambia el día, refresca
let lastDay = todayKey();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (todayKey() !== lastDay) { lastDay = todayKey(); session = null; }
  renderAll();
});

renderAll();
