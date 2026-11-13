import { Hono, type Context } from 'hono'
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie'
import QRCode from 'qrcode'
import { eventLabel, getWedding, profileFor, type WeddingConfig } from './config'
import {
  deleteRsvp, eventsOf, getRsvpByToken, importInvites, listInvites, listRsvps, matchInvite, normalizeName, saveRsvp, tokenForEmail,
  type Env, type ImportRow, type Rsvp,
} from './db'
import { Dashboard, Login, type Tab } from './pages/admin'
import { Home, Thanks } from './pages/site'
import { Accueil, ClassicThanks, Infos, Lieu, Programme, RsvpPage, Splash } from './pages/classic'

type C = Context<{ Bindings: Env }>
const app = new Hono<{ Bindings: Env }>()

const wedding = (c: C) => getWedding(c.env.WEDDING_SLUG)
const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null)
const int = (v: unknown, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number(v)) || min))
const visibleEvents = (w: WeddingConfig, k?: string | null) => {
  const { key, profile } = profileFor(w, k)
  return { key, events: w.events.filter((e) => profile.events.includes(e.key)) }
}

app.get('/favicon.svg', (c) => {
  const w = wedding(c)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${w.theme.primary}"/><text x="32" y="42" font-family="Georgia,serif" font-size="26" text-anchor="middle" fill="#fff">${w.partner1[0]}${w.partner2[0]}</text></svg>`
  return c.body(svg, 200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' })
})

app.get('/robots.txt', (c) => c.text('User-agent: *\nDisallow: /espace-maries\n'))

// ---------- Site public ----------

app.get('/', async (c) => {
  const w = wedding(c)
  const { key, events } = visibleEvents(w, c.req.query('k'))
  const token = c.req.query('modifier')
  const existing = token ? await getRsvpByToken(c.env.DB, token) : null
  if (w.layout === 'classic') {
    const k = key !== w.defaultProfile && w.profiles ? key : ''
    if (token) return c.redirect(`/rsvp?${k ? `k=${k}&` : ''}modifier=${token}`)
    return c.html(<Splash w={w} k={k} />)
  }
  return c.html(<Home w={w} profileKey={key} visible={events} existing={existing} />)
})

// Site multi-pages (layout « classic »)
const classicPage = (render: (w: WeddingConfig, k: string, events: WeddingConfig['events'], c: C) => unknown) => async (c: C) => {
  const w = wedding(c)
  if (w.layout !== 'classic') return c.redirect('/')
  const { key, events } = visibleEvents(w, c.req.query('k'))
  const k = key !== w.defaultProfile && w.profiles ? key : ''
  return c.html((await render(w, k, events, c)) as string)
}
app.get('/accueil', classicPage((w, k, events) => <Accueil w={w} k={k} visible={events} />))
app.get('/lieu', classicPage((w, k, events) => <Lieu w={w} k={k} visible={events} />))
app.get('/programme', classicPage((w, k, events) => <Programme w={w} k={k} visible={events} />))
app.get('/infos', classicPage((w, k) => <Infos w={w} k={k} />))
app.get('/rsvp', classicPage(async (w, k, events, c) => {
  const token = c.req.query('modifier')
  const existing = token ? await getRsvpByToken(c.env.DB, token) : null
  return <RsvpPage w={w} k={k} visible={events} existing={existing} />
}))

app.post('/rsvp', async (c) => {
  const w = wedding(c)
  const body = await c.req.parseBody({ all: true })
  if (body.site_web) return c.redirect('/') // champ piège anti-robots
  const { key, events } = visibleEvents(w, text(body.k, 40))
  const rsvpEvents = events.filter((e) => !e.noRsvp)
  const prenom = text(body.prenom, 80)
  const nom = text(body.nom, 80)
  const email = text(body.email, 160)?.toLowerCase() ?? null
  const absent = body.presence === 'non'
  const max = w.rsvp.maxPersons

  // En cas de refus, on réaffiche le formulaire tel que saisi (et on garde le lien de modification)
  const fail = (error: string) => {
    const evs: Record<string, number> = {}
    for (const e of rsvpEvents) if (([] as unknown[]).concat(body.evt ?? []).includes(e.key)) evs[e.key] = int(body[`nb_${e.key}`], 1, max)
    const draft: Rsvp = {
      id: 0, token: text(body.token, 64) ?? '', prenom: prenom ?? '', nom: nom ?? '', email, groupe: null,
      absent: body.presence === 'non' ? 1 : 0, guests: int(body.guests, 1, max), events: JSON.stringify(evs),
      companions: text(body.companions, 300), dietary: text(body.dietary, 500), menu: text(body.menu, 80), message: text(body.message, 2000),
      created_at: '', updated_at: '',
    }
    if (w.layout === 'classic') return c.html(<RsvpPage w={w} k={key !== w.defaultProfile && w.profiles ? key : ''} visible={events} error={error} existing={draft} />, 400)
    return c.html(<Home w={w} profileKey={key} visible={events} error={error} existing={draft} />, 400)
  }
  if (!prenom || !nom) return fail('Merci d’indiquer votre prénom et votre nom.')
  if (w.rsvp.askEmail && !email) return fail('Merci d’indiquer votre email.')
  if (body.presence !== 'oui' && body.presence !== 'non') return fail('Merci d’indiquer si vous serez présent(e).')

  // Seuls les événements prévus pour ce lien d'invitation sont enregistrés
  const chosen: Record<string, number> = {}
  if (!absent && w.rsvp.perEvent) {
    const checked = ([] as unknown[]).concat(body.evt ?? [])
    for (const e of rsvpEvents) if (checked.includes(e.key)) chosen[e.key] = int(body[`nb_${e.key}`], 1, max)
    if (!Object.keys(chosen).length) return fail('Merci de cocher au moins un événement, ou d’indiquer que vous ne pourrez pas venir.')
  }

  const token = text(body.token, 64) ?? (await tokenForEmail(c.env.DB, email))
  const rsvp = await saveRsvp(c.env.DB, {
    prenom, nom, email, groupe: w.profiles ? key : null, absent: absent ? 1 : 0,
    guests: absent || w.rsvp.perEvent ? 0 : int(body.guests, 1, max),
    events: JSON.stringify(chosen),
    companions: absent ? null : text(body.companions, 300),
    dietary: absent ? null : text(body.dietary, 500),
    menu: absent ? null : text(body.menu, 80),
    message: text(body.message, 2000),
  }, token ?? undefined)
  if (w.guestList) await matchInvite(c.env.DB, rsvp)
  return c.redirect(`/merci/${rsvp.token}${key !== w.defaultProfile && w.profiles ? `?k=${key}` : ''}`)
})

app.get('/merci/:token', async (c) => {
  const w = wedding(c)
  const rsvp = await getRsvpByToken(c.env.DB, c.req.param('token'))
  if (!rsvp) return c.redirect('/')
  const k = c.req.query('k') ?? ''
  if (w.layout === 'classic') return c.html(<ClassicThanks w={w} rsvp={rsvp} events={w.events} k={k} />)
  return c.html(<Thanks w={w} rsvp={rsvp} events={w.events} k={k} />)
})

// ---------- Espace mariés ----------

const COOKIE = 'maries'
const secret = (c: C) => c.env.SESSION_SECRET || `session:${c.env.ADMIN_PASSWORD}`

app.get('/espace-maries/connexion', (c) => c.html(<Login w={wedding(c)} />))

app.post('/espace-maries/connexion', async (c) => {
  const body = await c.req.parseBody()
  if (!c.env.ADMIN_PASSWORD || body.password !== c.env.ADMIN_PASSWORD) {
    await new Promise((r) => setTimeout(r, 600)) // ralentit les essais en série
    return c.html(<Login w={wedding(c)} error="Mot de passe incorrect." />, 401)
  }
  await setSignedCookie(c, COOKIE, String(Date.now() + 30 * 864e5), secret(c), {
    httpOnly: true, secure: new URL(c.req.url).protocol === 'https:', sameSite: 'Lax', path: '/espace-maries', maxAge: 30 * 86400,
  })
  return c.redirect('/espace-maries')
})

app.post('/espace-maries/deconnexion', (c) => {
  deleteCookie(c, COOKIE, { path: '/espace-maries' })
  return c.redirect('/espace-maries/connexion')
})

app.use('/espace-maries/*', async (c, next) => {
  if (c.req.path === '/espace-maries/connexion') return next()
  const v = await getSignedCookie(c, secret(c), COOKIE)
  if (!v || Number(v) < Date.now()) return c.redirect('/espace-maries/connexion')
  await next()
})
app.use('/espace-maries', async (c, next) => {
  const v = await getSignedCookie(c, secret(c), COOKIE)
  if (!v || Number(v) < Date.now()) return c.redirect('/espace-maries/connexion')
  await next()
})

const siteUrl = (c: C, w: WeddingConfig) => w.siteUrl ?? new URL(c.req.url).origin + '/'
const qrSvg = (url: string) => QRCode.toString(url, { type: 'svg', errorCorrectionLevel: 'H', margin: 4 })

app.get('/espace-maries', async (c) => {
  const w = wedding(c)
  const tab = (c.req.query('tab') ?? 'reponses') as Tab
  const [rsvps, invites] = await Promise.all([listRsvps(c.env.DB), w.guestList ? listInvites(c.env.DB) : Promise.resolve([])])
  const base = siteUrl(c, w)
  const shareLinks = w.profiles
    ? Object.entries(w.profiles).map(([k, p]) => ({ label: `${p.label} — ${p.events.length} moment(s)`, url: k === w.defaultProfile ? base : `${base}?k=${k}` }))
    : [{ label: 'Lien du site', url: base }]
  return c.html(
    <Dashboard
      w={w} tab={tab} rsvps={rsvps} invites={invites} flash={c.req.query('m')}
      q={c.req.query('q') ?? ''} groupe={c.req.query('groupe') ?? ''} evt={c.req.query('evt') ?? ''} statut={c.req.query('statut') ?? ''}
      shareLinks={shareLinks} siteUrl={base} qrSvg={tab === 'partage' ? await qrSvg(base) : ''}
    />,
  )
})

app.get('/espace-maries/qr.svg', async (c) => c.body(await qrSvg(siteUrl(c, wedding(c))), 200, { 'Content-Type': 'image/svg+xml' }))

const csv = (rows: (string | number | null | undefined)[][], name: string) =>
  new Response('﻿' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""')}"`).join(';')).join('\r\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"` },
  })

app.get('/espace-maries/reponses.csv', async (c) => {
  const w = wedding(c)
  const { q = '', groupe = '', evt = '' } = c.req.query()
  const evs = w.events.filter((e) => !e.noRsvp)
  const rows = (await listRsvps(c.env.DB)).filter((r: Rsvp) =>
    (!q || normalizeName(`${r.prenom} ${r.nom} ${r.email ?? ''}`).includes(normalizeName(q))) && (!groupe || r.groupe === groupe) && (!evt || (!r.absent && eventsOf(r)[evt])))
  const head = ['Nom', 'Prénom', 'Email', 'Groupe', 'Présent', ...(w.rsvp.perEvent ? evs.map((e) => `${eventLabel(w, e)} (pers.)`) : ['Personnes']), 'Accompagnants', 'Menu', 'Restrictions', 'Message', 'Date de réponse']
  return csv([head, ...rows.map((r) => [
    r.nom, r.prenom, r.email, r.groupe ? w.profiles?.[r.groupe]?.label ?? r.groupe : '', r.absent ? 'Non' : 'Oui',
    ...(w.rsvp.perEvent ? evs.map((e) => eventsOf(r)[e.key] ?? 0) : [r.guests]),
    r.companions, r.menu, r.dietary, r.message, r.updated_at,
  ])], 'reponses-mariage')
})

app.post('/espace-maries/reponses/:id/supprimer', async (c) => {
  await deleteRsvp(c.env.DB, Number(c.req.param('id')))
  return c.redirect('/espace-maries?m=' + encodeURIComponent('Réponse supprimée.'))
})

// Invités attendus
const backToInvites = (c: C, m: string) => c.redirect('/espace-maries?tab=invites&m=' + encodeURIComponent(m))

app.post('/espace-maries/invites', async (c) => {
  const b = await c.req.parseBody()
  const nom = text(b.nom, 80), prenom = text(b.prenom, 80), nb = int(b.nombre_personnes, 1, 50)
  if (!nom || !prenom) return backToInvites(c, 'Nom et prénom requis.')
  const id = Number(b.id)
  if (id) await c.env.DB.prepare('UPDATE invites SET nom = ?, prenom = ?, nombre_personnes = ?, ambigu = 0 WHERE id = ?').bind(nom, prenom, nb, id).run()
  else await c.env.DB.prepare('INSERT INTO invites (nom, prenom, nombre_personnes) VALUES (?, ?, ?)').bind(nom, prenom, nb).run()
  return backToInvites(c, id ? 'Invité modifié.' : `${prenom} ${nom} a été ajouté(e).`)
})

app.post('/espace-maries/invites/import', async (c) => {
  const rows = await c.req.json<ImportRow[]>().catch(() => null)
  if (!Array.isArray(rows)) return c.json({ error: 'Format invalide' }, 400)
  const res = await importInvites(c.env.DB, rows)
  // Rapproche les nouvelles fiches des réponses déjà reçues
  const rsvps = await listRsvps(c.env.DB)
  for (const r of rsvps.reverse()) await matchInvite(c.env.DB, r)
  return c.json(res)
})

app.post('/espace-maries/invites/:id/statut', async (c) => {
  const b = await c.req.parseBody()
  const repondu = b.statut === 'repondu'
  await c.env.DB.prepare(`UPDATE invites SET statut = ?, date_reponse = ${repondu ? "datetime('now')" : 'NULL'}, rsvp_id = NULL, ambigu = 0 WHERE id = ?`)
    .bind(repondu ? 'repondu' : 'en_attente', Number(c.req.param('id'))).run()
  return backToInvites(c, repondu ? 'Marqué comme répondu.' : 'Remis en attente.')
})

app.post('/espace-maries/invites/:id/supprimer', async (c) => {
  await c.env.DB.prepare('DELETE FROM invites WHERE id = ?').bind(Number(c.req.param('id'))).run()
  return backToInvites(c, 'Fiche supprimée.')
})

app.get('/espace-maries/relance.csv', async (c) => {
  const pending = (await listInvites(c.env.DB)).filter((i) => i.statut === 'en_attente')
  return csv([['Nom', 'Prénom', 'Nombre de personnes'], ...pending.map((i) => [i.nom, i.prenom, i.nombre_personnes])], 'invites-a-relancer')
})

app.notFound((c) => c.redirect('/'))

export default app
