import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'
import type { WeddingConfig, WeddingEvent } from '../config'
import { eventsOf, type Rsvp } from '../db'
import { Svg } from '../icons'
import { css, fontsHref } from '../styles'
import { siteScript } from '../client/site'

const maps = (q: string) => ({
  google: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
  waze: `https://waze.com/ul?q=${encodeURIComponent(q)}`,
  apple: `https://maps.apple.com/?q=${encodeURIComponent(q)}`,
  embed: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed`,
})

const Names = ({ w }: { w: WeddingConfig }) => (
  <>
    {w.partner1}
    <span class="amp">&amp;</span>
    {w.partner2}
  </>
)

export function Page({ w, title, children, bodyClass }: { w: WeddingConfig; title: string; children: Child; bodyClass?: string }) {
  return (
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{title}</title>
        <meta name="description" content={w.seo.description} />
        <meta name="theme-color" content={w.theme.background} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:title" content={w.seo.title} />
        <meta property="og:description" content={w.seo.description} />
        {w.seo.image && <meta property="og:image" content={w.seo.image} />}
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link rel="stylesheet" href={fontsHref(w.theme)} />
        <style>{raw(css(w.theme))}</style>
      </head>
      <body class={bodyClass}>{children}</body>
    </html>
  )
}

type HomeProps = {
  w: WeddingConfig
  profileKey: string
  visible: WeddingEvent[]
  existing?: Rsvp | null // réponse en cours de modification
  error?: string
}

export function Home({ w, profileKey, visible, existing, error }: HomeProps) {
  const keys = visible.map((e) => e.key)
  const venues = w.venues.filter((v) => !v.onlyForEvents || v.onlyForEvents.some((k) => keys.includes(k)))
  const days = [...new Set(visible.map((e) => e.day))]
  const hasInfos = !!(w.infos || w.access?.length)
  const nav: [string, string, boolean][] = [
    ['histoire', w.story?.title ?? 'Notre histoire', !!w.story],
    ['programme', 'Programme', visible.length > 0],
    ['lieu', venues.length > 1 ? 'Les lieux' : 'Le lieu', venues.length > 0],
    ['infos', 'Infos', hasInfos],
    ['hebergement', 'Hébergement', !!w.hotels?.length],
    ['faq', 'FAQ', !!w.faq?.length],
    ['rsvp', 'RSVP', true],
  ]
  const hasBg = !!(w.media.heroImage || w.media.heroVideo)
  const k = profileKey !== w.defaultProfile ? profileKey : ''
  return (
    <Page w={w} title={w.seo.title} bodyClass={hasBg ? 'on-image' : ''}>
      <div class="bgfix" aria-hidden="true">
        {w.media.heroImage && (
          <picture>
            {w.media.heroImageMobile && <source media="(max-width: 768px), (orientation: portrait)" srcset={w.media.heroImageMobile} />}
            <img src={w.media.heroImage} alt="" />
          </picture>
        )}
        {w.media.heroVideo && <video data-bgvideo src={w.media.heroVideo} muted playsinline loop autoplay preload="auto"></video>}
        {hasBg && <div class="veil"></div>}
      </div>

      {w.splash.enabled && (
        <div class="splash" id="splash">
          {w.media.splashVideo && <video src={w.media.splashVideo} muted playsinline loop autoplay></video>}
          {(w.media.splashVideo || hasBg) && <div class="veil"></div>}
          <div class="inner">
            {w.splash.kicker && <p class="kicker">{w.splash.kicker}</p>}
            <h1><Names w={w} /></h1>
            <p>{w.splash.text ?? `${w.dateLabel} · ${w.place}`}</p>
            <button class="btn" type="button" data-enter>Entrer</button>
          </div>
        </div>
      )}

      <nav class="nav" id="nav">
        <a class="mono" href="#accueil">{w.monogram ?? `${w.partner1[0]} & ${w.partner2[0]}`}</a>
        <button class="burger" type="button" aria-label="Menu" data-burger><Svg name="menu" /></button>
        <ul>
          {nav.filter(([, , on]) => on).map(([id, label]) => <li><a href={`#${id}`}>{label}</a></li>)}
        </ul>
      </nav>

      <header class={`hero${w.hero.photo ? ' with-photo' : ''}`} id="accueil">
        {!hasBg && w.monogram && <div class="mono-bg" aria-hidden="true">{w.monogram}</div>}
        {w.hero.photo && (
          <figure class="hero-photo"><img src={w.hero.photo} alt={`${w.partner1} et ${w.partner2}`} style={w.hero.photoPosition ? `object-position:${w.hero.photoPosition}` : undefined} /></figure>
        )}
        <div class="hero-text">
          {w.hero.kicker && <p class="kicker">{w.hero.kicker}</p>}
          <h1><Names w={w} /></h1>
          {w.hero.text && <p>{w.hero.text}</p>}
          <div class="date">{w.dateLabel}</div>
          <div class="place">{w.place}</div>
          <div class="countdown" data-countdown={w.dateISO}>
            {['jours', 'heures', 'minutes', 'secondes'].map((u, i) => (
              <div style={w.theme.countdownColors ? `--c:${w.theme.countdownColors[i]}` : ''}><b data-u={i}>--</b><small>{u}</small></div>
            ))}
          </div>
          <a class="btn" href="#rsvp">{w.hero.cta ?? "Répondre à l'invitation"}</a>
        </div>
      </header>

      <main>
        {w.quote && (
          <section><div class="narrow panel reveal"><p class="quote">« {w.quote} »</p><p class="sign">{w.partner1} &amp; {w.partner2}</p></div></section>
        )}

        {w.story && (
          <section id="histoire">
            <div class="narrow panel reveal">
              <div class="head"><h2>{w.story.title}</h2><div class="rule">✦</div></div>
              {w.story.paragraphs.map((p) => <p class="lead">{p}</p>)}
              {w.story.signature && <p class="sign">{w.story.signature}</p>}
            </div>
          </section>
        )}

        {visible.length > 0 && (
          <section id="programme">
            <div class="wrap panel reveal">
              <div class="head">
                <h2>{w.programme?.title ?? 'Le programme'}</h2>
                <div class="rule">✦</div>
                {w.programme?.intro && <p class="lead">{w.programme.intro}</p>}
                {w.programme?.provisional && <span class="badge">Programme provisoire</span>}
              </div>
              {days.map((day) => (
                <div class="day">
                  {days.length > 1 && <h3>{day}</h3>}
                  <ul class="timeline">
                    {visible.filter((e) => e.day === day).map((e) => (
                      <li>
                        <span class="ico"><Svg name={e.icon ?? 'flower'} /></span>
                        <div>
                          <div class="time">{e.time}</div>
                          <div class="t">{e.title}</div>
                          {e.note && <div class="n">{e.note}</div>}
                          {days.length === 1 && <div class="n">{e.day}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {venues.length > 0 && (
          <section id="lieu">
            <div class="wrap panel reveal">
              <div class="head"><h2>{venues.length > 1 ? 'Les lieux' : 'Le lieu'}</h2><div class="rule">✦</div></div>
              {venues.map((v) => {
                const m = maps(`${v.name}, ${v.address}`)
                return (
                  <div class="venue">
                    {v.label && venues.length > 1 && <p class="kicker">{v.label}</p>}
                    <h3>{v.name}</h3>
                    <div class="addr"><Svg name="pin" size={18} /> {v.address}</div>
                    {v.description && <p>{v.description}</p>}
                    <iframe class="map" title={`Carte : ${v.name}`} src={m.embed} loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                    <div class="links">
                      <a class="btn ghost small" href={m.google} target="_blank" rel="noopener"><Svg name="nav" size={14} /> Google Maps</a>
                      <a class="btn ghost small" href={m.waze} target="_blank" rel="noopener"><Svg name="nav" size={14} /> Waze</a>
                      <a class="btn ghost small" href={m.apple} target="_blank" rel="noopener"><Svg name="nav" size={14} /> Apple Plans</a>
                    </div>
                  </div>
                )
              })}
              {!!w.access?.length && (
                <div class="grid" style="margin-top:2rem">
                  {w.access.map((a) => <div class="icard"><span class="ic"><Svg name={a.icon ?? 'info'} /></span><div><h4>{a.title}</h4><p>{a.text}</p></div></div>)}
                </div>
              )}
            </div>
          </section>
        )}

        {w.infos && (
          <section id="infos">
            <div class="wrap panel reveal">
              <div class="head"><h2>Infos pratiques</h2><div class="rule">✦</div></div>
              <div class="grid">
                {w.infos.dressCode && (
                  <div class="icard" style="grid-column:1/-1">
                    <span class="ic"><Svg name="shirt" /></span>
                    <div>
                      <h4>Dress code</h4>
                      <p style="white-space:pre-line">{w.infos.dressCode.text}</p>
                      {w.infos.dressCode.swatches && (
                        <div class="swatches">{w.infos.dressCode.swatches.map((s) => <div><span style={`background:${s.hex}`}></span>{s.name}</div>)}</div>
                      )}
                    </div>
                  </div>
                )}
                {w.infos.blocks?.map((b) => <div class="icard"><span class="ic"><Svg name="info" /></span><div><h4>{b.title}</h4><p>{b.text}</p></div></div>)}
              </div>
            </div>
          </section>
        )}

        {!!w.hotels?.length && (
          <section id="hebergement">
            <div class="wrap panel reveal">
              <div class="head"><h2>Où dormir</h2><div class="rule">✦</div></div>
              <div class="grid">
                {w.hotels.map((h) => (
                  <div class="icard">
                    <span class="ic"><Svg name="bed" /></span>
                    <div><h4>{h.name}</h4>{h.place && <p class="hint">{h.place}</p>}<p style="white-space:pre-line">{h.text}</p>{h.url && <a href={h.url} target="_blank" rel="noopener">Site de l'hôtel →</a>}</div>
                  </div>
                ))}
              </div>
              {w.hotelsNote && <p class="lead" style="margin-top:1.5rem">{w.hotelsNote}</p>}
            </div>
          </section>
        )}

        {!!w.faq?.length && (
          <section id="faq">
            <div class="narrow panel reveal">
              <div class="head"><h2>Questions fréquentes</h2><div class="rule">✦</div></div>
              {w.faq.map((f) => <details><summary>{f.q}</summary><p>{f.a}</p></details>)}
            </div>
          </section>
        )}

        <section id="rsvp">
          <div class="narrow panel reveal">
            <RsvpForm w={w} visible={visible} k={k} existing={existing} error={error} />
          </div>
        </section>
      </main>

      <footer>
        <div class="names"><Names w={w} /></div>
        <p>{w.dateLabel} · {w.place}</p>
        {w.footerNote && <p>{w.footerNote}</p>}
        <a href="/espace-maries">Espace mariés</a>
      </footer>

      {!!w.media.music?.length && (
        <button class="music" type="button" data-music={JSON.stringify(w.media.music)} aria-label="Activer la musique" hidden>
          <span data-on hidden><Svg name="volume" /></span><span data-off><Svg name="mute" /></span>
        </button>
      )}
      <script>{raw(siteScript)}</script>
    </Page>
  )
}

function RsvpForm({ w, visible, k, existing, error }: { w: WeddingConfig; visible: WeddingEvent[]; k: string; existing?: Rsvp | null; error?: string }) {
  const r = w.rsvp
  const ev = existing ? eventsOf(existing) : {}
  const absent = existing ? !!existing.absent : false
  return (
    <>
      <div class="head">
        <h2>{existing ? 'Modifier ma réponse' : "Répondez à l'invitation"}</h2>
        <div class="rule">✦</div>
        {r.deadlineLabel && <p class="lead">Merci de nous répondre avant le <strong>{r.deadlineLabel}</strong>.</p>}
      </div>
      <form class="rsvp" method="post" action="/rsvp" data-rsvp>
        {error && <p class="err">{error}</p>}
        <input type="hidden" name="k" value={k} />
        {existing && <input type="hidden" name="token" value={existing.token} />}
        <div class="two">
          <label class="f">Prénom *<input name="prenom" required maxlength={80} autocomplete="given-name" value={existing?.prenom ?? ''} /></label>
          <label class="f">Nom *<input name="nom" required maxlength={80} autocomplete="family-name" value={existing?.nom ?? ''} /></label>
        </div>
        {r.askEmail && <label class="f">Email *<input name="email" type="email" required maxlength={160} autocomplete="email" value={existing?.email ?? ''} /></label>}

        <div class="choice">
          <label><input type="radio" name="presence" value="oui" required checked={existing ? !absent : false} /> Je serai présent(e)</label>
          <label><input type="radio" name="presence" value="non" checked={absent} /> Je ne pourrai pas venir</label>
        </div>

        <div data-when-present>
          {r.perEvent ? (
            <div class="evts">
              <label class="f">Nombre de participants (vous inclus)
                <input type="number" name="participants" min={1} max={r.maxPersons} value={Math.max(1, ...Object.values(ev))} inputmode="numeric" data-participants />
              </label>
              <p class="hint">Cochez les moments où vous serez là ; le nombre de personnes est reporté sur chaque événement et reste modifiable.</p>
              {visible.filter((e) => !e.noRsvp).map((e) => (
                <label class="evt">
                  <input type="checkbox" name="evt" value={e.key} checked={!!ev[e.key]} />
                  <span class="grow"><b>{e.title}</b><small>{e.day} · {e.time}</small></span>
                  <input type="number" name={`nb_${e.key}`} min={1} max={r.maxPersons} value={ev[e.key] || 1} aria-label={`Nombre de personnes pour ${e.title}`} inputmode="numeric" />
                </label>
              ))}
            </div>
          ) : (
            <label class="f">Nombre de personnes (vous inclus)
              <select name="guests">
                {Array.from({ length: r.maxPersons }, (_, i) => i + 1).map((n) => <option value={n} selected={(existing?.guests || 1) === n}>{n} {n > 1 ? 'personnes' : 'personne'}</option>)}
              </select>
            </label>
          )}
          {r.askCompanions && <label class="f" style="margin-top:1.3rem">Accompagnants<input name="companions" maxlength={300} placeholder="Prénoms de vos accompagnants" value={existing?.companions ?? ''} /></label>}
          {!!r.menuChoices?.length && (
            <label class="f" style="margin-top:1.3rem">Menu
              <select name="menu"><option value="">—</option>{r.menuChoices.map((m) => <option selected={existing?.menu === m}>{m}</option>)}</select>
            </label>
          )}
          {r.askDietary && <label class="f" style="margin-top:1.3rem">Restrictions alimentaires / allergies<textarea name="dietary" rows={2} maxlength={500} placeholder="Végétarien, sans gluten, allergies…">{existing?.dietary ?? ''}</textarea></label>}
        </div>

        <label class="f">Un message pour les mariés<textarea name="message" rows={3} maxlength={2000} placeholder={`Un petit mot pour ${w.partner1} & ${w.partner2}…`}>{existing?.message ?? ''}</textarea></label>
        <input type="text" name="site_web" tabindex={-1} autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true" />
        <button class="btn" type="submit" style="justify-self:center">{existing ? 'Enregistrer les modifications' : 'Envoyer ma réponse'}</button>
      </form>
    </>
  )
}

export function Thanks({ w, rsvp, events, k }: { w: WeddingConfig; rsvp: Rsvp; events: WeddingEvent[]; k: string }) {
  const ev = eventsOf(rsvp)
  const editUrl = `/?${k ? `k=${k}&` : ''}modifier=${rsvp.token}#rsvp`
  return (
    <Page w={w} title={`Merci · ${w.seo.title}`}>
      <div class="bgfix" aria-hidden="true">
        {w.media.heroImage && <img src={w.media.heroImage} alt="" />}
        {w.media.heroImage && <div class="veil"></div>}
      </div>
      <main>
        <section style="min-height:100svh;display:flex;align-items:center">
          <div class="narrow panel ok" style="width:100%">
            <h2>Merci{rsvp.prenom ? ` ${rsvp.prenom}` : ''} !</h2>
            <p>Votre réponse a bien été enregistrée.</p>
            <ul class="recap">
              {rsvp.absent ? (
                <li>Vous ne pourrez malheureusement pas être présent(e). Vous nous manquerez !</li>
              ) : w.rsvp.perEvent ? (
                events.filter((e) => ev[e.key]).map((e) => <li><span>{e.time} · {e.title}</span><strong>{ev[e.key]} pers.</strong></li>)
              ) : (
                <li><span>Présence confirmée</span><strong>{rsvp.guests} pers.</strong></li>
              )}
            </ul>
            {w.rsvp.thanks && !rsvp.absent && <p>{w.rsvp.thanks}</p>}
            <p class="hint">Gardez ce lien pour modifier votre réponse plus tard :</p>
            <p><a href={editUrl}>Modifier ma réponse</a></p>
            <p><a class="btn" href={`/${k ? `?k=${k}` : ''}`}>Retour au site</a></p>
          </div>
        </section>
      </main>
    </Page>
  )
}
