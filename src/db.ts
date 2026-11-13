export type Env = { DB: D1Database; WEDDING_SLUG: string; ADMIN_PASSWORD: string; SESSION_SECRET?: string }

export type Rsvp = {
  id: number; token: string; prenom: string; nom: string; email: string | null; groupe: string | null; absent: number
  guests: number; events: string; companions: string | null; dietary: string | null; menu: string | null; message: string | null
  created_at: string; updated_at: string
}

export type Invite = {
  id: number; nom: string; prenom: string; nombre_personnes: number; statut: 'en_attente' | 'repondu'; date_reponse: string | null
  rsvp_id: number | null; origine: 'manuel' | 'import'; ambigu: number; created_at: string
}

export type RsvpInput = Omit<Rsvp, 'id' | 'token' | 'created_at' | 'updated_at'>

export const eventsOf = (r: Pick<Rsvp, 'events'>): Record<string, number> => {
  try {
    return JSON.parse(r.events || '{}')
  } catch {
    return {}
  }
}

// Personnes présentes : somme par événement en mode détaillé, sinon nombre total
export const peopleOf = (r: Rsvp) => (r.absent ? 0 : r.guests || Math.max(0, ...Object.values(eventsOf(r))))

export async function listRsvps(db: D1Database) {
  return (await db.prepare('SELECT * FROM rsvps ORDER BY created_at DESC').all<Rsvp>()).results
}

export async function getRsvpByToken(db: D1Database, token: string) {
  return db.prepare('SELECT * FROM rsvps WHERE token = ?').bind(token).first<Rsvp>()
}

const COLS = ['prenom', 'nom', 'email', 'groupe', 'absent', 'guests', 'events', 'companions', 'dietary', 'menu', 'message'] as const

export async function saveRsvp(db: D1Database, input: RsvpInput, token?: string): Promise<Rsvp> {
  const values = COLS.map((k) => input[k])
  if (token) {
    const existing = await getRsvpByToken(db, token)
    if (existing) {
      await db.prepare(`UPDATE rsvps SET ${COLS.map((k) => `${k} = ?`).join(', ')}, updated_at = datetime('now') WHERE token = ?`)
        .bind(...values, token).run()
      return (await getRsvpByToken(db, token))!
    }
  }
  const newToken = crypto.randomUUID().replace(/-/g, '')
  await db.prepare(`INSERT INTO rsvps (token, ${COLS.join(', ')}) VALUES (?, ${COLS.map(() => '?').join(', ')})`)
    .bind(newToken, ...values).run()
  return (await getRsvpByToken(db, newToken))!
}

// Même email = même réponse (comme sur les sites avec email) : on met à jour au lieu de dupliquer
export async function tokenForEmail(db: D1Database, email: string | null) {
  if (!email) return undefined
  return (await db.prepare('SELECT token FROM rsvps WHERE email = ?').bind(email).first<{ token: string }>())?.token
}

export async function deleteRsvp(db: D1Database, id: number) {
  await db.batch([
    db.prepare("UPDATE invites SET statut = 'en_attente', date_reponse = NULL, rsvp_id = NULL WHERE rsvp_id = ?").bind(id),
    db.prepare('DELETE FROM rsvps WHERE id = ?').bind(id),
  ])
}

// ---- Liste des invités ----

export const normalizeName = (v: unknown) =>
  String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

const sameName = (i: { nom: string; prenom: string }, nom: string, prenom: string) => {
  const c = `${normalizeName(i.nom)} ${normalizeName(i.prenom)}`
  return c === `${normalizeName(nom)} ${normalizeName(prenom)}` || c === `${normalizeName(prenom)} ${normalizeName(nom)}`
}

export async function listInvites(db: D1Database) {
  return (await db.prepare('SELECT * FROM invites ORDER BY nom COLLATE NOCASE, prenom COLLATE NOCASE').all<Invite>()).results
}

// Rapproche une réponse de la liste des invités (accents, casse et ordre nom/prénom ignorés).
// Homonymes : rien n'est coché automatiquement, les fiches sont signalées « à vérifier ».
export async function matchInvite(db: D1Database, rsvp: Rsvp) {
  const invites = await listInvites(db)
  const matches = invites.filter((i) => sameName(i, rsvp.nom, rsvp.prenom))
  if (matches.length > 1) {
    await db.batch(matches.map((m) => db.prepare('UPDATE invites SET ambigu = 1 WHERE id = ?').bind(m.id)))
    return
  }
  const hit = matches[0]
  if (!hit || hit.ambigu || (hit.statut === 'repondu' && hit.rsvp_id !== rsvp.id)) return
  await db.prepare("UPDATE invites SET statut = 'repondu', date_reponse = datetime('now'), rsvp_id = ? WHERE id = ?").bind(rsvp.id, hit.id).run()
}

export type ImportRow = { nom: string; prenom: string; nombre_personnes: number }

export async function importInvites(db: D1Database, rows: ImportRow[]) {
  const existing = await listInvites(db)
  const seen = new Set<string>()
  const stmts: D1PreparedStatement[] = []
  let created = 0, updated = 0, skipped = 0
  for (const row of rows.slice(0, 2000)) {
    const nom = String(row.nom ?? '').trim(), prenom = String(row.prenom ?? '').trim()
    const nb = Math.max(1, Math.round(Number(row.nombre_personnes) || 1))
    if (!nom || !prenom) { skipped++; continue }
    const hit = existing.find((i) => sameName(i, nom, prenom))
    if (hit) {
      stmts.push(db.prepare('UPDATE invites SET nombre_personnes = ? WHERE id = ?').bind(nb, hit.id))
      updated++
      continue
    }
    const key = `${normalizeName(nom)}|${normalizeName(prenom)}`
    if (seen.has(key)) { skipped++; continue }
    seen.add(key)
    stmts.push(db.prepare("INSERT INTO invites (nom, prenom, nombre_personnes, origine) VALUES (?, ?, ?, 'import')").bind(nom, prenom, nb))
    created++
  }
  if (stmts.length) await db.batch(stmts)
  return { created, updated, skipped }
}
