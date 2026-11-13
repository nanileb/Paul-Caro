// Script de l'espace mariés : confirmations, copie de liens, QR en PNG, fenêtres invités, import Excel
export const adminScript = `(() => {
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];

$$('form[data-confirm]').forEach((f) => f.addEventListener('submit', (e) => { if (!confirm(f.dataset.confirm)) e.preventDefault(); }));

$$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = 'Copié !'; setTimeout(() => (b.textContent = 'Copier'), 2000); } catch {}
}));

const png = $('[data-qr-png]');
if (png) png.addEventListener('click', () => {
  const svg = $('#qr svg'), img = new Image(), size = 2048;
  img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = size; const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); ctx.drawImage(img, 0, 0, size, size);
    const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'qr-code.png'; a.click(); };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
});

$$('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
$$('[data-open]').forEach((b) => b.addEventListener('click', () => {
  const d = $('#dlg-' + b.dataset.open); if (b.dataset.open === 'add') { const f = $('form', d); f.reset(); f.id.value = ''; $('[data-title]', d).textContent = 'Ajouter un invité'; } d.showModal();
}));
$$('[data-edit]').forEach((b) => b.addEventListener('click', () => {
  const v = JSON.parse(b.dataset.edit), d = $('#dlg-add'), f = $('form', d);
  f.id.value = v.id; f.nom.value = v.nom; f.prenom.value = v.prenom; f.nombre_personnes.value = v.nb; $('[data-title]', d).textContent = "Modifier l'invité"; d.showModal();
}));

// Import Excel : lecture dans le navigateur, aperçu, puis envoi des lignes valides
const file = $('[data-import-file]');
if (file) {
  let rows = [];
  const go = $('[data-import-go]'), out = $('[data-import-preview]');
  const loadXlsx = () => window.XLSX ? Promise.resolve() : new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  const cap = (v) => { const s = String(v ?? '').trim(); return s ? s[0].toUpperCase() + s.slice(1) : ''; };
  const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) && n >= 1 ? Math.round(n) : 1; };
  const isNum = (v) => v !== '' && isFinite(parseFloat(String(v ?? '').replace(',', '.')));
  file.addEventListener('change', async () => {
    out.innerHTML = '<p class="muted">Lecture du fichier…</p>'; go.disabled = true;
    try {
      await loadXlsx();
      const wb = XLSX.read(await file.files[0].arrayBuffer(), { type: 'array' });
      const m = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' }).filter((r) => r.some((c) => String(c).trim()));
      if (!m.length) throw new Error('Le fichier est vide.');
      const start = isNum(m[0][2]) ? 0 : 1, ignored = [];
      rows = [];
      m.slice(start).forEach((l, i) => { const nom = cap(l[0]), prenom = cap(l[1]);
        if (!nom || !prenom) ignored.push('Ligne ' + (i + start + 1) + ' : ' + (!nom && !prenom ? 'nom et prénom manquants' : !nom ? 'nom manquant' : 'prénom manquant'));
        else rows.push({ nom, prenom, nombre_personnes: num(l[2]) }); });
      out.innerHTML = '<p><b>' + rows.length + '</b> ligne(s) valide(s), <b>' + ignored.length + '</b> ignorée(s).</p>' +
        (ignored.length ? '<p class="muted">' + ignored.slice(0, 8).join('<br>') + (ignored.length > 8 ? '<br>…' : '') + '</p>' : '') +
        '<div class="scroll" style="max-height:240px"><table><tr><th>Nom</th><th>Prénom</th><th class="c">Pers.</th></tr>' +
        rows.map((r) => '<tr><td>' + esc(r.nom) + '</td><td>' + esc(r.prenom) + '</td><td class="c">' + r.nombre_personnes + '</td></tr>').join('') + '</table></div>';
      go.disabled = !rows.length;
    } catch (e) { out.innerHTML = '<p class="no">Impossible de lire ce fichier : ' + esc(e.message || 'format non reconnu') + '</p>'; }
  });
  go.addEventListener('click', async () => {
    go.disabled = true; go.textContent = 'Import en cours…';
    const r = await fetch('/espace-maries/invites/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) });
    const j = await r.json().catch(() => ({}));
    location.href = '/espace-maries?tab=invites&m=' + encodeURIComponent(r.ok ? 'Import terminé : ' + j.created + ' ajouté(s), ' + j.updated + ' mis à jour, ' + j.skipped + ' ignoré(s).' : "L'import a échoué.");
  });
}
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
})();`
