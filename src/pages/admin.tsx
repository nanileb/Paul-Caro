import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'
import { eventLabel, groupLabel, type WeddingConfig } from '../config'
import { eventsOf, normalizeName, peopleOf, type Invite, type Rsvp } from '../db'
import { adminCss } from '../styles'
import { adminScript } from '../client/admin'

const fmt = (iso: string | null) =>
  iso ? new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z')).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' }) : '—'

function Shell({ w, children }: { w: WeddingConfig; children: Child }) {
  return (
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>Espace mariés · {w.partner1} &amp; {w.partner2}</title>
        <style>{raw(adminCss)}</style>
      </head>
      <body>{children}<script>{raw(adminScript)}</script></body>
    </html>
  )
}

export function Login({ w, error }: { w: WeddingConfig; error?: string }) {
  return (
    <Shell w={w}>
      <form class="login" method="post" action="/espace-maries/connexion">
        <h1>Espace mariés</h1>
        <p class="muted">Accès réservé à {w.partner1} &amp; {w.partner2}</p>
        <input type="password" name="password" placeholder="Mot de passe" required autofocus />
        {error && <p class="no">{error}</p>}
        <button class="btn" type="submit">Accéder</button>
        <p><a href="/">← Retour au site</a></p>
      </form>
    </Shell>
  )
}

export type Tab = 'reponses' | 'participants' | 'restrictions' | 'messages' | 'invites' | 'partage'

type Props = {
  w: WeddingConfig; tab: Tab; rsvps: Rsvp[]; invites: Invite[]; flash?: string
  q: string; groupe: string; evt: string; statut: string
  shareLinks: { label: string; url: string }[]; qrSvg: string; siteUrl: string
}

export function Dashboard(p: Props) {
  const { w, rsvps } = p
  const present = rsvps.filter((r) => !r.absent)
  const perEvent = w.rsvp.perEvent
  const rsvpEvents = w.events.filter((e) => !e.noRsvp)
  const eventTotals = rsvpEvents.map((e) => ({
    e,
    people: present.reduce((n, r) => n + (eventsOf(r)[e.key] || 0), 0),
    who: present.filter((r) => eventsOf(r)[e.key]).sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
  }))
  const tabs: [Tab, string, boolean][] = [
    ['reponses', 'Réponses', true],
    ['participants', 'Qui vient à quoi', perEvent],
    ['restrictions', 'Restrictions', true],
    ['messages', "Livre d'or", true],
    ['invites', 'Invités à relancer', !!w.guestList],
    ['partage', 'Liens & QR code', true],
  ]
  return (
    <Shell w={w}>
      <div class="top">
        <div><strong>Espace mariés</strong><small>{w.partner1} &amp; {w.partner2} · {w.dateLabel}</small></div>
        <div class="bar" style="margin:0">
          <a class="btn light sm" href="/" target="_blank">Voir le site</a>
          <form method="post" action="/espace-maries/deconnexion"><button class="btn sm" style="background:transparent;border-color:#fff">Déconnexion</button></form>
        </div>
      </div>
      <div class="wrap">
        {p.flash && <div class="flash">{p.flash}</div>}
        <div class="kpis">
          <div class="kpi"><b>{rsvps.length}</b><span>réponses</span></div>
          <div class="kpi"><b>{rsvps.length - present.length}</b><span>absents</span></div>
          {perEvent
            ? eventTotals.map((t) => <div class="kpi"><b>{t.people}</b><span>{eventLabel(w, t.e)} (pers.)</span></div>)
            : <div class="kpi"><b>{present.reduce((n, r) => n + peopleOf(r), 0)}</b><span>personnes attendues</span></div>}
        </div>
        <nav class="tabs">
          {tabs.filter(([, , on]) => on).map(([k, l]) => <a class={p.tab === k ? 'on' : ''} href={`/espace-maries?tab=${k}`}>{l}</a>)}
        </nav>
        {p.tab === 'reponses' && <Responses {...p} />}
        {p.tab === 'participants' && (
          <div class="cols">
            {eventTotals.map((t) => (
              <div class="box">
                <h3>{eventLabel(w, t.e)} <span class="pill">{t.people} pers.</span></h3>
                {t.who.length ? <ul class="list">{t.who.map((r) => <li><span>{r.prenom} {r.nom}</span><b>{eventsOf(r)[t.e.key]}</b></li>)}</ul> : <p class="muted">Personne pour le moment.</p>}
              </div>
            ))}
          </div>
        )}
        {p.tab === 'restrictions' && (
          <div class="box">
            <h3>Restrictions alimentaires</h3>
            <ul class="list">{rsvps.filter((r) => r.dietary || r.menu).map((r) => <li><b>{r.prenom} {r.nom}</b><span>{[r.menu, r.dietary].filter(Boolean).join(' · ')}</span></li>)}</ul>
            {!rsvps.some((r) => r.dietary || r.menu) && <p class="muted">Aucune restriction renseignée.</p>}
          </div>
        )}
        {p.tab === 'messages' && (
          <div class="cols">
            {rsvps.filter((r) => r.message).map((r) => <div class="box"><p>« {r.message} »</p><p class="muted">— {r.prenom} {r.nom}, {fmt(r.created_at)}</p></div>)}
            {!rsvps.some((r) => r.message) && <p class="muted">Aucun message pour le moment.</p>}
          </div>
        )}
        {p.tab === 'invites' && <Invites {...p} />}
        {p.tab === 'partage' && (
          <>
            <div class="box">
              <h3>Liens à partager</h3>
              {w.profiles && Object.keys(w.profiles).length > 1 && <p class="muted">Chaque lien n'affiche que les moments prévus pour ce groupe d'invités.</p>}
              {p.shareLinks.map((l) => (
                <div><strong>{l.label}</strong><div class="copy"><input readonly value={l.url} /><button class="btn sm" type="button" data-copy={l.url}>Copier</button></div></div>
              ))}
            </div>
            <div class="box">
              <h3>QR code pour les faire-part</h3>
              <div class="qr">
                <div class="code" id="qr">{raw(p.qrSvg)}</div>
                <div>
                  <p>Lien encodé : <a href={p.siteUrl}>{p.siteUrl}</a></p>
                  <p class="bar">
                    <button class="btn sm" type="button" data-qr-png>Télécharger en PNG (2048 px)</button>
                    <a class="btn light sm" href="/espace-maries/qr.svg" download="qr-code.svg">Télécharger en SVG</a>
                  </p>
                  <p class="muted">Conseil : imprimez-le à 2 cm de côté minimum et testez le scan avant l'envoi des faire-part. Le code utilise une correction d'erreur élevée (H).</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  )
}

function Responses({ w, rsvps, q, groupe, evt }: Props) {
  const rsvpEvents = w.events.filter((e) => !e.noRsvp)
  const s = normalizeName(q)
  const nameCount = new Map<string, number>()
  for (const r of rsvps) { const n = `${normalizeName(r.prenom)} ${normalizeName(r.nom)}`; nameCount.set(n, (nameCount.get(n) ?? 0) + 1) }
  const isDup = (r: Rsvp) => (nameCount.get(`${normalizeName(r.prenom)} ${normalizeName(r.nom)}`) ?? 0) > 1
  const rows = rsvps.filter((r) =>
    (!s || normalizeName(`${r.prenom} ${r.nom} ${r.email ?? ''}`).includes(s)) &&
    (!groupe || r.groupe === groupe) &&
    (!evt || (!r.absent && eventsOf(r)[evt])),
  )
  const qs = new URLSearchParams({ q, groupe, evt }).toString()
  return (
    <div class="box">
      <form class="bar" method="get">
        <input type="hidden" name="tab" value="reponses" />
        <input name="q" value={q} placeholder="Rechercher un nom…" />
        {w.profiles && Object.keys(w.profiles).length > 1 && (
          <select name="groupe"><option value="">Tous les groupes</option>{Object.entries(w.profiles).map(([k, pr]) => <option value={k} selected={groupe === k}>{pr.label}</option>)}</select>
        )}
        {w.rsvp.perEvent && <select name="evt"><option value="">Tous les événements</option>{rsvpEvents.map((e) => <option value={e.key} selected={evt === e.key}>{eventLabel(w, e)}</option>)}</select>}
        <button class="btn light sm">Filtrer</button>
        <a class="btn sm" href={`/espace-maries/reponses.csv?${qs}`}>Exporter en CSV (Excel)</a>
      </form>
      <div class="scroll">
        <table>
          <tr>
            <th>Nom</th>{w.profiles && <th>Groupe</th>}<th class="c">Présent</th>
            {w.rsvp.perEvent ? rsvpEvents.map((e) => <th class="c">{eventLabel(w, e)}</th>) : <th class="c">Pers.</th>}
            {w.rsvp.askCompanions && <th>Accompagnants</th>}<th>Restrictions</th><th>Message</th><th>Date</th><th></th>
          </tr>
          {rows.map((r) => {
            const ev = eventsOf(r)
            return (
              <tr>
                <td><b>{r.prenom} {r.nom}</b>{isDup(r) && <> <span class="pill warn" title="Plusieurs réponses à ce nom : vérifiez s'il s'agit d'un doublon">doublon ?</span></>}{r.email && <div class="muted">{r.email}</div>}</td>
                {w.profiles && <td><span class="pill">{groupLabel(w, r.groupe)}</span></td>}
                <td class="c">{r.absent ? <span class="no">Non</span> : <span class="yes">Oui</span>}</td>
                {w.rsvp.perEvent
                  ? rsvpEvents.map((e) => <td class="c">{r.absent ? '—' : ev[e.key] ? <span class="yes">✓ {ev[e.key]}</span> : <span class="muted">✗</span>}</td>)
                  : <td class="c">{r.absent ? '—' : r.guests}</td>}
                {w.rsvp.askCompanions && <td>{r.companions || '—'}</td>}
                <td>{[r.menu, r.dietary].filter(Boolean).join(' · ') || '—'}</td>
                <td>{r.message || '—'}</td>
                <td class="muted">{fmt(r.updated_at)}</td>
                <td><form method="post" action={`/espace-maries/reponses/${r.id}/supprimer`} data-confirm={`Supprimer la réponse de ${r.prenom} ${r.nom} ?`}><button class="btn red sm">Suppr.</button></form></td>
              </tr>
            )
          })}
          {rows.length === 0 && <tr><td colspan={12} class="muted">Aucune réponse.</td></tr>}
        </table>
      </div>
    </div>
  )
}

function Invites({ invites, q, statut }: Props) {
  const s = normalizeName(q)
  const rows = invites.filter((i) => (!statut || i.statut === statut) && (!s || normalizeName(`${i.nom} ${i.prenom}`).includes(s)))
  const repondu = invites.filter((i) => i.statut === 'repondu').length
  return (
    <>
      <div class="kpis">
        <div class="kpi"><b>{invites.length}</b><span>invités dans la liste</span></div>
        <div class="kpi"><b>{repondu}</b><span>ont répondu</span></div>
        <div class="kpi"><b>{invites.length - repondu}</b><span>en attente</span></div>
        <div class="kpi"><b>{invites.reduce((n, i) => n + i.nombre_personnes, 0)}</b><span>personnes attendues</span></div>
      </div>
      <div class="box">
        <div class="bar">
          <button class="btn sm" type="button" data-open="import">Importer un fichier Excel</button>
          <button class="btn light sm" type="button" data-open="add">Ajouter un invité</button>
          <a class="btn light sm" href="/espace-maries/relance.csv">Exporter la liste de relance</a>
        </div>
        <form class="bar" method="get">
          <input type="hidden" name="tab" value="invites" />
          <select name="statut"><option value="">Tous</option><option value="en_attente" selected={statut === 'en_attente'}>En attente</option><option value="repondu" selected={statut === 'repondu'}>Répondu</option></select>
          <input name="q" value={q} placeholder="Rechercher un nom ou un prénom…" />
          <button class="btn light sm">Filtrer</button>
        </form>
        <div class="scroll">
          <table>
            <tr><th>Nom</th><th>Prénom</th><th class="c">Pers.</th><th>Statut</th><th>Réponse</th><th>Origine</th><th></th></tr>
            {rows.map((i) => (
              <tr>
                <td><b>{i.nom}</b>{!!i.ambigu && <div><span class="pill warn">homonyme : à vérifier</span></div>}</td>
                <td>{i.prenom}</td>
                <td class="c">{i.nombre_personnes}</td>
                <td>{i.statut === 'repondu' ? <span class="pill">Répondu</span> : <span class="pill wait">En attente</span>}</td>
                <td class="muted">{fmt(i.date_reponse)}</td>
                <td class="muted">{i.origine === 'import' ? 'Importé' : 'Manuel'}</td>
                <td class="bar" style="margin:0;flex-wrap:nowrap">
                  <form method="post" action={`/espace-maries/invites/${i.id}/statut`}><input type="hidden" name="statut" value={i.statut === 'repondu' ? 'en_attente' : 'repondu'} /><button class="btn light sm">{i.statut === 'repondu' ? 'Remettre en attente' : 'Marquer répondu'}</button></form>
                  <button class="btn light sm" type="button" data-edit={JSON.stringify({ id: i.id, nom: i.nom, prenom: i.prenom, nb: i.nombre_personnes })}>Modifier</button>
                  <form method="post" action={`/espace-maries/invites/${i.id}/supprimer`} data-confirm={`Supprimer la fiche de ${i.prenom} ${i.nom} ? La réponse RSVP éventuelle est conservée.`}><button class="btn red sm">Suppr.</button></form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colspan={7} class="muted">{invites.length ? 'Aucun invité ne correspond à ce filtre.' : 'Aucun invité. Importez un fichier Excel ou ajoutez un invité.'}</td></tr>}
          </table>
        </div>
      </div>

      <dialog id="dlg-add">
        <form method="post" action="/espace-maries/invites" data-invite-form>
          <h3 data-title>Ajouter un invité</h3>
          <input type="hidden" name="id" />
          <p><label>Nom<br /><input name="nom" required /></label></p>
          <p><label>Prénom<br /><input name="prenom" required /></label></p>
          <p><label>Nombre de personnes<br /><input name="nombre_personnes" type="number" min={1} value={1} /></label></p>
          <p class="bar"><button class="btn">Enregistrer</button><button class="btn light" type="button" data-close>Annuler</button></p>
        </form>
      </dialog>

      <dialog id="dlg-import">
        <h3>Importer un fichier Excel</h3>
        <p class="muted">Colonnes à partir de A : <b>Nom</b>, <b>Prénom</b>, <b>Nombre de personnes</b>. Seul le premier onglet est lu, la ligne d'en-têtes est détectée automatiquement. Les invités déjà présents sont mis à jour, pas dupliqués.</p>
        <input type="file" accept=".xlsx,.xls,.csv" data-import-file />
        <div data-import-preview></div>
        <p class="bar"><button class="btn" type="button" data-import-go disabled>Confirmer l'import</button><button class="btn light" type="button" data-close>Fermer</button></p>
      </dialog>
    </>
  )
}
