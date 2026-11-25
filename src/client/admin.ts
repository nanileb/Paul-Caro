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

// Retour visuel pendant l'enregistrement (après la confirmation éventuelle)
document.addEventListener('submit', (e) => {
  if (e.defaultPrevented) return;
  const b = e.target.querySelector('button[data-busy]');
  if (b) setTimeout(() => { b.disabled = true; b.textContent = b.dataset.busy; });
});

// Import Excel : lecture dans le navigateur (rien n'est envoyé à un service externe), aperçu, puis envoi des lignes retenues
const file = $('[data-import-file]');
if (file) {
  let rows = [];
  const dlg = $('#dlg-import'), go = $('[data-import-go]'), out = $('[data-import-preview]');
  const norm = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\\s+/g, ' ').trim();
  const existing = JSON.parse(dlg.dataset.existing || '[]');
  const findExisting = (nom, prenom) => { const a = norm(nom), b = norm(prenom); return existing.find((x) => (x[0] === a && x[1] === b) || (x[0] === b && x[1] === a)); };
  const loadXlsx = () => window.XLSX ? Promise.resolve() : new Promise((ok, ko) => { const s = document.createElement('script'); s.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js'; s.onload = ok; s.onerror = () => ko(new Error('le module de lecture Excel n’a pas pu être chargé (vérifiez votre connexion)')); document.head.appendChild(s); });
  const clean = (v) => String(v ?? '').replace(/\\s+/g, ' ').trim();
  const isNum = (v) => clean(v) !== '' && isFinite(parseFloat(clean(v).replace(',', '.')));
  const num = (v) => { const n = Math.round(parseFloat(clean(v).replace(',', '.'))); return isFinite(n) && n >= 1 ? Math.min(n, 50) : 1; };
  const reset = () => { rows = []; out.innerHTML = ''; go.disabled = true; go.textContent = "Confirmer l'import"; };
  $('[data-open="import"]').addEventListener('click', () => { file.value = ''; reset(); });
  file.addEventListener('change', async () => {
    reset();
    const f = file.files[0]; if (!f) return;
    out.innerHTML = '<p class="muted">Lecture du fichier…</p>';
    try {
      if (!/\\.(xlsx|xls|csv)$/i.test(f.name)) throw new Error('choisissez un fichier Excel (.xlsx ou .xls)');
      await loadXlsx();
      const buf = await f.arrayBuffer();
      let wb;
      if (/\\.csv$/i.test(f.name)) {
        let txt; try { txt = new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { txt = new TextDecoder('windows-1252').decode(buf); }
        wb = XLSX.read(txt.replace(/^﻿/, ''), { type: 'string', raw: true });
      } else {
        try { wb = XLSX.read(buf, { type: 'array' }); } catch { throw new Error('le fichier est illisible ou protégé par un mot de passe'); }
      }
      if (!wb.SheetNames.length) throw new Error('le fichier ne contient aucun onglet');
      const all = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: true, defval: '' });
      const m = all.map((r, i) => ({ r, n: i + 1 })).filter(({ r }) => r.some((c) => clean(c)));
      if (!m.length) throw new Error('le premier onglet est vide');
      // En-têtes : du texte en colonne C (pas un nombre), ou « Nom / Prénom » en A-B avec C vide
      const h = m[0].r, headerWords = /^(nom|prenom|nom de famille|name|first ?name|last ?name|invite|invites)$/;
      const isHeader = (clean(h[2]) !== '' && !isNum(h[2])) || (clean(h[2]) === '' && (headerWords.test(norm(h[0])) || headerWords.test(norm(h[1]))));
      const ignored = [], seen = new Set();
      let nNew = 0, nUpd = 0;
      for (const { r, n } of m.slice(isHeader ? 1 : 0)) {
        const nom = clean(r[0]), prenom = clean(r[1]);
        if (!nom || !prenom) { ignored.push('Ligne ' + n + ' : ' + (!nom && !prenom ? 'nom et prénom manquants' : !nom ? 'nom manquant' : 'prénom manquant')); continue; }
        const key = [norm(nom), norm(prenom)].sort().join('|');
        if (seen.has(key)) { ignored.push('Ligne ' + n + ' : ' + nom + ' ' + prenom + ' apparaît plusieurs fois dans le fichier'); continue; }
        seen.add(key);
        const nb = num(r[2]), ex = findExisting(nom, prenom);
        const action = ex ? 'Mis à jour' + (ex[2] !== nb ? ' (' + ex[2] + ' → ' + nb + ' pers.)' : ' (inchangé)') : 'Nouveau';
        ex ? nUpd++ : nNew++;
        rows.push({ nom, prenom, nombre_personnes: nb, action, invalid: clean(r[2]) !== '' && !isNum(r[2]) });
      }
      out.innerHTML = (isHeader ? '<p class="muted">Ligne d’en-têtes détectée et ignorée.</p>' : '') +
        '<p><b>' + rows.length + '</b> ligne(s) valide(s) : <b>' + nNew + '</b> nouveau(x) invité(s), <b>' + nUpd + '</b> mis à jour, <b>' + ignored.length + '</b> ignorée(s).</p>' +
        (nUpd ? '<p class="muted">Les invités déjà dans la liste ne sont pas recréés : seul leur nombre de personnes est mis à jour.</p>' : '') +
        (ignored.length ? '<details><summary>Lignes ignorées ou en erreur (' + ignored.length + ')</summary><p class="no">' + ignored.map(esc).join('<br>') + '</p></details>' : '') +
        '<div class="scroll" style="max-height:280px;overflow-y:auto"><table><tr><th>Nom</th><th>Prénom</th><th class="c">Nombre de personnes</th><th>Action</th></tr>' +
        rows.map((r) => '<tr><td>' + esc(r.nom) + '</td><td>' + esc(r.prenom) + '</td><td class="c">' + r.nombre_personnes + (r.invalid ? ' <span class="muted" title="Valeur invalide en colonne C, 1 par défaut">*</span>' : '') + '</td><td>' + (r.action === 'Nouveau' ? '<span class="pill">Nouveau</span>' : '<span class="pill wait">' + esc(r.action) + '</span>') + '</td></tr>').join('') + '</table></div>';
      go.disabled = !rows.length;
    } catch (e) { rows = []; out.innerHTML = '<p class="no">Impossible de lire ce fichier : ' + esc((e && e.message) || 'format non reconnu') + '.</p>'; }
  });
  go.addEventListener('click', async () => {
    go.disabled = true; go.textContent = 'Import en cours…';
    try {
      const r = await fetch('/espace-maries/invites/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows.map(({ nom, prenom, nombre_personnes }) => ({ nom, prenom, nombre_personnes }))) });
      if (r.redirected || !r.ok) throw new Error(r.redirected ? 'session expirée, reconnectez-vous' : 'erreur du serveur');
      const j = await r.json();
      location.href = '/espace-maries?tab=invites&m=' + encodeURIComponent('Import terminé : ' + j.created + ' invité(s) ajouté(s), ' + j.updated + ' mis à jour, ' + j.skipped + ' ignoré(s).');
    } catch (e) {
      out.insertAdjacentHTML('afterbegin', '<p class="no">L’import a échoué (' + esc(e.message) + '). Aucune modification n’a été perdue, vous pouvez réessayer.</p>');
      go.disabled = false; go.textContent = "Confirmer l'import";
    }
  });
}
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
})();`
