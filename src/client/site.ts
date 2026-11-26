// Script du site public, injecté tel quel dans la page (pas de build côté navigateur)
export const siteScript = `(() => {
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = { get: (k) => { try { return sessionStorage.getItem(k) } catch { return null } }, set: (k, v) => { try { sessionStorage.setItem(k, v) } catch {} } };

// ---------- Musique : un seul lecteur pour tout le site ----------
// Les pistes viennent de la config du mariage (media.music), posées sur le bouton [data-music].
const VOLUME = 0.5, STEP = 0.05, TICK = 60;
const btn = $('[data-music]');
const tracks = btn ? JSON.parse(btn.dataset.music) : [];
let audio = null, idx = 0, fadeId = 0, musicOn = false;
if (tracks.length) {
  audio = new Audio(tracks[0]);
  audio.loop = tracks.length === 1; audio.preload = 'auto'; audio.volume = 0;
  audio.addEventListener('ended', () => { if (audio.loop) return; idx = (idx + 1) % tracks.length; audio.src = tracks[idx]; if (musicOn) audio.play().catch(() => {}); });
}
const setIcon = (on) => { if (!btn) return; $('[data-on]', btn).hidden = !on; $('[data-off]', btn).hidden = on; btn.setAttribute('aria-label', on ? 'Couper la musique' : 'Activer la musique'); btn.classList.toggle('off', !on); };
const showBtn = () => { if (btn) btn.hidden = false; };
const stopFade = () => { clearInterval(fadeId); fadeId = 0; };
// Fondu jusqu'à VOLUME. Sur iPhone/iPad, audio.volume est en lecture seule (toujours 1) : on arrête tout de suite.
function fadeIn() {
  stopFade();
  fadeId = setInterval(() => {
    const next = Math.min(VOLUME, Math.round((audio.volume + STEP) * 100) / 100);
    audio.volume = next;
    if (Math.abs(audio.volume - next) > 0.001 || next >= VOLUME) stopFade();
  }, TICK);
}
// À appeler dans un clic (les navigateurs bloquent le son sans interaction)
function musicStart() {
  if (!audio) return;
  stopFade(); audio.muted = false; audio.volume = 0; musicOn = true; setIcon(true);
  let p; try { p = audio.play(); } catch (e) { p = Promise.reject(e); }
  Promise.resolve(p).then(() => { if (musicOn) fadeIn(); }).catch(() => { musicOn = false; setIcon(false); });
}
// Couper : immédiat, sans fondu
function musicStop() { stopFade(); musicOn = false; if (audio) { audio.muted = true; audio.pause(); } setIcon(false); }
if (btn) { setIcon(false); btn.addEventListener('click', () => (musicOn ? musicStop() : musicStart())); }

// ---------- Navigation sans rechargement (site multi-pages) ----------
// Les pages sont échangées sur place pour que la musique continue d'une page à l'autre.
const soft = document.body.hasAttribute('data-soft-nav') && !!window.fetch && !!window.DOMParser;
let cleanups = [], current = location.pathname + location.search;
const later = (fn) => cleanups.push(fn);
async function go(url, opts = {}) {
  let res, doc;
  try {
    res = await fetch(url, opts.req || { credentials: 'same-origin' });
    if (!(res.headers.get('content-type') || '').includes('text/html')) throw 0;
    doc = new DOMParser().parseFromString(await res.text(), 'text/html');
  } catch { return opts.fallback ? opts.fallback() : location.assign(url); }
  const dest = res.url || url;
  if (!doc.body.hasAttribute('data-soft-nav')) return location.assign(dest);
  const u = new URL(dest, location.href), hash = new URL(url, location.href).hash;
  if (!opts.pop) history[opts.replace ? 'replaceState' : 'pushState'](null, '', u.pathname + u.search + hash);
  current = u.pathname + u.search;
  cleanups.forEach((fn) => fn()); cleanups = [];
  document.title = doc.title;
  $$('script, [data-music]', doc.body).forEach((el) => el.parentNode.removeChild(el));
  document.body.style.overflow = '';
  document.body.replaceChildren(...doc.body.childNodes);
  if (btn) document.body.append(btn);
  const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
  if (target) target.scrollIntoView(); else scrollTo(0, 0);
  initPage();
}
if (soft) {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download')) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || u.pathname.startsWith('/espace-maries') || /\\.[a-z0-9]+$/i.test(u.pathname)) return;
    if (u.pathname + u.search === current && u.hash) return; // simple ancre dans la page
    e.preventDefault(); go(u.href);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (e.defaultPrevented || !f.matches('[data-rsvp]')) return;
    e.preventDefault();
    const send = $('button[type=submit]', f); if (send) send.disabled = true;
    go(f.action, { req: { method: 'POST', body: new URLSearchParams(new FormData(f)), credentials: 'same-origin' }, fallback: () => f.submit() });
  });
  addEventListener('popstate', () => { if (location.pathname + location.search !== current) go(location.href, { pop: true }); });
}

function initPage() {
// Écran d'entrée (une seule fois par visite) : le clic sur « Entrer » lance la musique
const enter = $('[data-enter]'), splash = $('#splash');
if (!enter) showBtn();
if (splash) {
  if (store.get('entered') === '1') { splash.parentNode.removeChild(splash); showBtn(); }
  else { document.body.style.overflow = 'hidden';
    enter.addEventListener('click', () => { store.set('entered', '1'); splash.classList.add('gone'); document.body.style.overflow = ''; showBtn(); musicStart(); setTimeout(() => splash.parentNode && splash.parentNode.removeChild(splash), 1000); }); }
} else if (enter) {
  // Site multi-pages : l'écran d'entrée est la page « / », « Entrer » mène à /accueil
  if (store.get('entered') === '1' && soft) { go(enter.href, { replace: true }); return; }
  enter.addEventListener('click', (e) => {
    store.set('entered', '1'); showBtn(); musicStart();
    if (soft) { e.preventDefault(); go(enter.href, { replace: true }); }
  });
}

// Compte à rebours
const cd = $('[data-countdown]');
if (cd) { const target = new Date(cd.dataset.countdown).getTime();
  const tick = () => { let d = target - Date.now();
    if (d <= 0) { cd.outerHTML = '<p class="today">C\\'est le grand jour !</p>'; return false; }
    const v = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
    v.forEach((n, i) => { cd.querySelector('[data-u="' + i + '"]').textContent = String(n).padStart(2, '0'); }); return true; };
  if (tick()) { const t = setInterval(tick, 1000); later(() => clearInterval(t)); } }

// Navigation : fond au défilement, menu mobile
const nav = $('#nav');
if (nav) { const onScroll = () => nav.classList.toggle('solid', scrollY > 40 || nav.classList.contains('open')); onScroll(); addEventListener('scroll', onScroll, { passive: true }); later(() => removeEventListener('scroll', onScroll));
  $('[data-burger]', nav).addEventListener('click', () => { nav.classList.toggle('open'); onScroll(); });
  $$('ul a', nav).forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); onScroll(); })); }

// Apparition des sections au défilement
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
$$('.reveal').forEach((el) => io.observe(el));
later(() => io.disconnect());

// Formulaire RSVP
const form = $('[data-rsvp]');
if (form) {
  const zone = $('[data-when-present]', form);
  const sync = () => { const absent = $('input[name=presence][value=non]', form).checked, present = $('input[name=presence][value=oui]', form).checked;
    zone.style.display = absent ? 'none' : ''; zone.style.opacity = present ? '1' : '.5';
    $$('.evt', form).forEach((row) => { const cb = $('input[type=checkbox]', row); const c = $('[data-cnt]', row); if (c.classList.contains('nbs')) c.style.display = cb.checked ? '' : 'none'; else c.style.visibility = cb.checked ? 'visible' : 'hidden'; $$('input[type=number]', row).forEach((nb) => { nb.disabled = !cb.checked; }); }); };
  const part = $('[data-participants]', form), kids = $('[data-kids]', form);
  // Cocher un moment reprend le nombre d'adultes (et d'enfants) indiqué plus haut
  $$('.evt input[type=checkbox]', form).forEach((cb) => cb.addEventListener('change', () => { if (!cb.checked) return; const row = cb.closest('.evt'), a = $('[data-a]', row), k = $('[data-k]', row);
    if (part && a) a.value = part.value || 1; if (kids && k) k.value = kids.value || 0; }));
  $$('input', form).forEach((i) => i.addEventListener('change', sync));
  if (part) part.addEventListener('input', () => $$('.evt [data-a]', form).forEach((n) => { n.value = part.value; }));
  if (kids) kids.addEventListener('input', () => $$('.evt [data-k]', form).forEach((n) => { n.value = kids.value; }));
  sync();
  form.addEventListener('submit', (e) => {
    const present = $('input[name=presence][value=oui]', form).checked;
    if (present && $$('.evt', form).length && !$$('.evt input[type=checkbox]:checked', form).length) { e.preventDefault(); alertBox('Merci de cocher au moins un événement, ou d\\'indiquer que vous ne pourrez pas venir.'); }
  });
  function alertBox(msg) { let p = $('.err', form); if (!p) { p = document.createElement('p'); p.className = 'err'; form.prepend(p); } p.textContent = msg; p.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}
}
initPage();
})();`
