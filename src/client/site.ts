// Script du site public, injecté tel quel dans la page (pas de build côté navigateur)
export const siteScript = `(() => {
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = { get: (k) => { try { return sessionStorage.getItem(k) } catch { return null } }, set: (k, v) => { try { sessionStorage.setItem(k, v) } catch {} } };

// Musique : une ou plusieurs pistes enchaînées, fondu à l'entrée, bouton couper/remettre
const btn = $('[data-music]');
let audio = null, idx = 0, tracks = btn ? JSON.parse(btn.dataset.music) : [];
const setIcon = (on) => { if (!btn) return; $('[data-on]', btn).hidden = !on; $('[data-off]', btn).hidden = on; btn.setAttribute('aria-label', on ? 'Couper la musique' : 'Activer la musique'); };
function fade(to) { const step = to > audio.volume ? 0.05 : -0.05; const id = setInterval(() => { const v = audio.volume + step; if ((step > 0 && v >= to) || (step < 0 && v <= to)) { audio.volume = to; clearInterval(id); if (to === 0) audio.pause(); } else audio.volume = v; }, 60); }
function play() {
  if (!tracks.length) return;
  if (!audio) { audio = new Audio(tracks[0]); audio.volume = 0; audio.loop = tracks.length === 1;
    audio.addEventListener('ended', () => { idx = (idx + 1) % tracks.length; audio.src = tracks[idx]; audio.play().catch(() => {}); }); }
  audio.play().then(() => { fade(0.5); setIcon(true); store.set('music', 'on'); }).catch(() => setIcon(false));
}
if (btn) { btn.hidden = false; btn.addEventListener('click', () => { if (audio && !audio.paused) { fade(0); setIcon(false); store.set('music', 'off'); } else play(); }); }

// Écran d'entrée (une seule fois par visite)
const splash = $('#splash');
if (splash) {
  if (store.get('entered') === '1') splash.remove();
  else { document.body.style.overflow = 'hidden';
    $('[data-enter]', splash).addEventListener('click', () => { store.set('entered', '1'); splash.classList.add('gone'); document.body.style.overflow = ''; play(); setTimeout(() => splash.remove(), 1000); }); }
}

// Compte à rebours
const cd = $('[data-countdown]');
if (cd) { const target = new Date(cd.dataset.countdown).getTime();
  const tick = () => { let d = target - Date.now();
    if (d <= 0) { cd.outerHTML = '<p class="today">C\\'est le grand jour !</p>'; return false; }
    const v = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
    v.forEach((n, i) => { cd.querySelector('[data-u="' + i + '"]').textContent = String(n).padStart(2, '0'); }); return true; };
  if (tick()) setInterval(tick, 1000); }

// Navigation : fond au défilement, menu mobile
const nav = $('#nav');
if (nav) { const onScroll = () => nav.classList.toggle('solid', scrollY > 40 || nav.classList.contains('open')); onScroll(); addEventListener('scroll', onScroll, { passive: true });
  $('[data-burger]', nav).addEventListener('click', () => { nav.classList.toggle('open'); onScroll(); });
  $$('ul a', nav).forEach((a) => a.addEventListener('click', () => { nav.classList.remove('open'); onScroll(); })); }

// Apparition des sections au défilement
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
$$('.reveal').forEach((el) => io.observe(el));

// Formulaire RSVP
const form = $('[data-rsvp]');
if (form) {
  const zone = $('[data-when-present]', form);
  const sync = () => { const absent = $('input[name=presence][value=non]', form).checked, present = $('input[name=presence][value=oui]', form).checked;
    zone.style.display = absent ? 'none' : ''; zone.style.opacity = present ? '1' : '.5';
    $$('.evt', form).forEach((row) => { const cb = $('input[type=checkbox]', row), nb = $('input[type=number]', row); nb.style.visibility = cb.checked ? 'visible' : 'hidden'; nb.disabled = !cb.checked; }); };
  const part = $('[data-participants]', form);
  // Cocher un moment reprend le nombre de participants indiqué plus haut
  $$('.evt input[type=checkbox]', form).forEach((cb) => cb.addEventListener('change', () => { if (cb.checked && part) $('input[type=number]', cb.closest('.evt')).value = part.value || 1; }));
  $$('input', form).forEach((i) => i.addEventListener('change', sync));
  if (part) part.addEventListener('input', () => $$('.evt', form).forEach((row) => { const n = $('input[type=number]', row); n.value = part.value; }));
  sync();
  form.addEventListener('submit', (e) => {
    const present = $('input[name=presence][value=oui]', form).checked;
    if (present && $$('.evt', form).length && !$$('.evt input[type=checkbox]:checked', form).length) { e.preventDefault(); alertBox('Merci de cocher au moins un événement, ou d\\'indiquer que vous ne pourrez pas venir.'); }
  });
  function alertBox(msg) { let p = $('.err', form); if (!p) { p = document.createElement('p'); p.className = 'err'; form.prepend(p); } p.textContent = msg; p.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}
})();`
