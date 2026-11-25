// Gabarit « classic » : site multi-pages (Accueil, Le lieu, Programme, Infos pratiques, RSVP)
// reprenant le design d'origine du site Base44 de Paul & Caroline (parchemin, olive, terracotta).
import type { Child } from 'hono/jsx'
import { raw } from 'hono/html'
import { eventLabel, type WeddingConfig, type WeddingEvent } from '../config'
import { eventsOf, type Rsvp } from '../db'
import { Svg } from '../icons'
import { ampCss, fontsHref } from '../styles'
import { siteScript } from '../client/site'

export type ClassicPage = 'accueil' | 'lieu' | 'programme' | 'infos' | 'rsvp'

const css = `
:root{--parchment:#FAF8F5;--deep:#F1EEE9;--olive:#2A481E;--olive-soft:#4F6440;--mist:#DFE4DA;--terra:#D06139;--terra-deep:#A64C30;--ochre:#E2A83C;--card:#FDFDFC;--muted:#5F6A58;
--title:'Cormorant Garamond',Georgia,serif;--body:'Inter',system-ui,sans-serif}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100vh;display:flex;flex-direction:column;font-family:var(--body);color:var(--olive);line-height:1.6;-webkit-font-smoothing:antialiased}
body{background-color:var(--parchment);background-image:radial-gradient(circle at 20% 30%,rgba(226,168,60,.05) 0,transparent 50%),radial-gradient(circle at 80% 70%,rgba(208,97,57,.05) 0,transparent 50%);background-attachment:fixed}
h1,h2,h3,h4{font-family:var(--title);font-weight:500;line-height:1.15;margin:0;color:var(--olive)}
a{color:inherit}img{max-width:100%;display:block}p{margin:0}
.amp{color:var(--terra);font-style:italic}
.kicker{font-size:.75rem;letter-spacing:.3em;text-transform:uppercase;color:var(--terra-deep);margin:0 0 .5rem}
.wrap{max-width:64rem;margin:0 auto;padding:0 1.25rem}.narrow{max-width:42rem;margin:0 auto;padding:0 1.25rem}
@media(min-width:640px){.wrap,.narrow{padding:0 2rem}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;font:500 .95rem var(--body);background:var(--terra);color:#fff;border:0;border-radius:999px;padding:.75rem 1.5rem;text-decoration:none;cursor:pointer;transition:background .2s}
.btn:hover{background:var(--terra-deep)}
.ghost{display:inline-flex;align-items:center;gap:.35rem;font-size:.9rem;color:var(--olive-soft);text-decoration:none;padding:.5rem .7rem;border-radius:999px;border:1px solid var(--mist);background:var(--card)}
.ghost:hover{border-color:var(--terra);color:var(--terra-deep)}
/* En-tête */
.top{position:sticky;top:0;z-index:40;border-bottom:1px solid rgba(223,228,218,.6);background:rgba(250,248,245,.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.top nav{max-width:72rem;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;position:relative}
@media(min-width:640px){.top nav{padding:1rem 2rem}}
.logo{font-family:var(--title);font-size:1.4rem;font-weight:500;text-decoration:none;line-height:1}
@media(min-width:640px){.logo{font-size:1.6rem}}
.links{display:flex;gap:2rem;list-style:none;margin:0;padding:0}
.links a{font-size:.9rem;letter-spacing:.02em;color:var(--olive-soft);text-decoration:none;transition:color .2s}
.links a:hover,.links a[aria-current]{color:var(--terra-deep)}.links a[aria-current]{font-weight:500}
.burger{display:none;width:44px;height:44px;align-items:center;justify-content:center;background:none;border:0;color:var(--olive);cursor:pointer;margin-right:-.6rem;border-radius:8px}
@media(max-width:767px){.burger{display:flex}.links{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;background:var(--parchment);border-bottom:1px solid var(--mist);padding:.5rem 1.25rem 1rem;box-shadow:0 12px 24px rgba(42,72,30,.08)}
  .nav.open .links{display:flex}.links a{display:block;padding:.85rem 0;font-size:1.05rem;border-bottom:1px solid rgba(223,228,218,.6)}.links li:last-child a{border:0}}
main{flex:1}
/* Accueil */
.hero{position:relative;height:68vh;min-height:460px;overflow:hidden}
@media(min-width:640px){.hero{height:78vh}}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,var(--parchment) 0%,rgba(250,248,245,.3) 50%,transparent 100%)}
.hero .txt{position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:0 1rem 3rem}
.hero .txt p{font-size:.75rem;letter-spacing:.35em;text-transform:uppercase;color:var(--olive);margin-bottom:.75rem;text-shadow:0 0 14px rgba(250,248,245,.95),0 0 4px rgba(250,248,245,.9)}
.hero h1{font-size:clamp(3rem,10vw,6rem);line-height:1}
.soon{border-bottom:1px solid rgba(223,228,218,.5);padding:4rem 0;text-align:center}
@media(min-width:640px){.soon{padding:5rem 0}}
.soon h2{font-size:clamp(1.9rem,5vw,2.4rem);font-weight:400;margin-bottom:2.5rem}
.countdown{display:flex;align-items:flex-end;justify-content:center;gap:clamp(.6rem,2.5vw,1.25rem)}
.countdown div{display:flex;flex-direction:column;align-items:center}
.countdown b{font-family:var(--title);font-weight:500;font-size:clamp(2.3rem,9vw,3.75rem);line-height:1;font-variant-numeric:lining-nums tabular-nums}
.countdown small{margin-top:.5rem;font-size:clamp(.62rem,2.2vw,.75rem);letter-spacing:.2em;text-transform:uppercase;color:var(--olive-soft)}
.countdown i{font-family:var(--title);font-style:normal;font-size:clamp(1.8rem,6vw,2.25rem);color:rgba(208,97,57,.5);padding-bottom:1.25rem}
.today{font-family:var(--title);font-size:2.4rem;color:var(--terra-deep)}
.quote{padding:5rem 0;text-align:center}
@media(min-width:640px){.quote{padding:7rem 0}}
.quote p{font-family:var(--title);font-size:clamp(1.5rem,3.6vw,1.9rem);line-height:1.55}
.quote .sig{margin-top:1.5rem;font-size:1.25rem;font-style:italic;color:var(--terra-deep)}
.deep{background:var(--deep)}
.tiles{display:grid;gap:1.25rem;grid-template-columns:1fr;padding-top:4rem;padding-bottom:4rem}
@media(min-width:640px){.tiles{grid-template-columns:1fr 1fr;padding-top:5rem;padding-bottom:5rem}}@media(min-width:1024px){.tiles{grid-template-columns:repeat(4,1fr)}}
.tile{display:flex;flex-direction:column;align-items:flex-start;border:1px solid rgba(223,228,218,.6);background:var(--card);border-radius:10px;padding:1.5rem;text-decoration:none;transition:transform .25s,box-shadow .25s,border-color .25s}
.tile:hover{transform:translateY(-4px);border-color:rgba(208,97,57,.4);box-shadow:0 8px 20px rgba(42,72,30,.08)}
.ico{display:flex;width:3rem;height:3rem;flex:none;align-items:center;justify-content:center;border-radius:50%;background:rgba(208,97,57,.1);color:var(--terra)}
.tile .ico{margin-bottom:1rem}.tile h3{font-size:1.3rem}.tile span.s{font-size:.875rem;color:var(--olive-soft);margin-top:.15rem}
.banner{position:relative;height:clamp(260px,40vw,420px);overflow:hidden;display:flex;align-items:center;justify-content:center;text-align:center}
.banner img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.banner:before{content:"";position:absolute;inset:0;z-index:1;background:rgba(30,40,20,.42)}
.banner p{position:relative;z-index:2;font-family:var(--title);font-size:clamp(1.5rem,4vw,2.4rem);color:#fff;max-width:44rem;padding:0 1.5rem;line-height:1.35;text-shadow:0 2px 16px rgba(0,0,0,.35)}
/* En-têtes de page */
.phead{padding:4rem 0 3rem;text-align:center}
@media(min-width:640px){.phead{padding:5rem 0 3.5rem}}
.phead h1{font-size:clamp(2.3rem,6vw,3rem)}
.phead .lead{max-width:36rem;margin:1rem auto 0;color:var(--olive-soft)}
.pill{display:inline-block;border-radius:999px;background:rgba(226,168,60,.16);padding:.35rem 1rem;font-size:.8rem;color:var(--olive-soft);margin-top:1rem}
.vhero{position:relative;height:clamp(220px,26vw,380px);overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff}
.vhero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vhero:before{content:"";position:absolute;inset:0;z-index:1;background:rgba(25,40,15,.5)}
.vhero>*{position:relative;z-index:2}.vhero .kicker{color:#fff;opacity:.9}.vhero h1{color:#fff;font-size:clamp(2.4rem,6vw,3.6rem)}
/* Le lieu */
.venue{padding:3.5rem 0 4rem;text-align:center}
.venue .desc{color:var(--olive-soft);max-width:36rem;margin:0 auto}
.venue .name{display:flex;align-items:center;justify-content:center;gap:.4rem;margin-top:2rem;font-weight:500}
.venue .name svg{color:var(--terra)}
.venue .addr{color:var(--olive-soft);margin:.4rem 0 1.25rem}
.venue .more{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-top:.8rem}
.map{width:100%;height:340px;border:1px solid rgba(223,228,218,.7);border-radius:12px;margin-top:2rem;background:var(--card);box-shadow:0 2px 10px rgba(42,72,30,.04)}
.sec{padding:4rem 0}@media(min-width:640px){.sec{padding:5rem 0}}
.sec>.wrap>h2,.sec>.narrow>h2{text-align:center;font-size:clamp(1.9rem,5vw,2.4rem);font-weight:400;margin-bottom:2rem}
.cards{display:grid;gap:1.25rem}@media(min-width:640px){.cards.two{grid-template-columns:1fr 1fr}}
.card{border:1px solid rgba(223,228,218,.6);background:var(--card);border-radius:12px;padding:1.5rem}
@media(min-width:640px){.card.big{padding:2rem}}
.card.row{display:flex;gap:1rem;align-items:flex-start}
.card h3{font-size:1.3rem}.card.big h3{font-size:1.5rem;margin-top:1rem}
.card p,.card .t{font-size:.92rem;color:var(--olive-soft);margin-top:.5rem;line-height:1.65}
.card .t{white-space:pre-line}
.card a.web{display:inline-block;margin-top:.8rem;font-size:.9rem;color:var(--terra-deep);font-weight:500;text-decoration:none}
.card a.web:hover{text-decoration:underline}
.card .t a{color:var(--terra-deep);font-weight:500}
.card .pill{margin-top:.9rem;font-size:.78rem}
.card.hotel{display:flex;flex-direction:column}.card.hotel .pill{align-self:flex-start;margin-top:.5rem}
.card.hotel .lead{font-family:var(--title);font-style:italic;font-size:1.12rem;line-height:1.45;color:var(--olive);margin-top:1rem}
.lines{list-style:none;margin:1.1rem 0 0;padding:0;display:grid;gap:.85rem;border-top:1px solid var(--mist);padding-top:1.1rem}
.lines li{display:flex;gap:.75rem;align-items:flex-start;font-size:.92rem;line-height:1.6;color:var(--olive-soft)}
.lines .li-ico{flex:none;width:30px;height:30px;border-radius:50%;background:rgba(208,97,57,.1);color:var(--terra);display:flex;align-items:center;justify-content:center;margin-top:-.05rem}
.lines a{color:var(--terra-deep);font-weight:500;white-space:nowrap}
.card.hotel a.web{margin-top:auto;padding-top:1.1rem}
.sh{display:flex;align-items:center;gap:1rem;margin-bottom:2rem}.sh svg{color:var(--terra);flex:none}
.sh h2{font-size:clamp(1.6rem,4vw,1.9rem);font-weight:400;white-space:nowrap}.sh:after{content:"";height:1px;flex:1;background:var(--mist)}
.note{margin-top:1.5rem;text-align:center;font-size:.9rem;color:var(--muted)}
/* Programme */
.day{padding:2.5rem 0}.day .sh svg{color:var(--ochre)}
.tl{list-style:none;margin:0;padding:0}
.tl li{position:relative;display:flex;gap:1.25rem;padding-bottom:2.5rem}.tl li:last-child{padding-bottom:0}
.tl li:not(:last-child):before{content:"";position:absolute;left:22px;top:3rem;height:calc(100% - 2rem);width:1px;background:var(--mist)}
.tl .dot{position:relative;z-index:1;display:flex;width:44px;height:44px;flex:none;align-items:center;justify-content:center;border-radius:50%;border:2px solid rgba(208,97,57,.4);background:var(--parchment);color:var(--terra)}
.tl .when{display:flex;align-items:baseline;flex-wrap:wrap;gap:.25rem .75rem}
.tl .time{font-family:var(--title);font-size:1.3rem;color:var(--terra-deep)}
.tl .tbc{font-size:.72rem;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
.tl h4{font-size:1.5rem;margin-top:.2rem}
.tl p{font-size:.92rem;color:var(--olive-soft);margin-top:.35rem;line-height:1.65}
/* FAQ */
details{border-bottom:1px solid rgba(223,228,218,.7)}
summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.25rem 0;cursor:pointer;font-family:var(--title);font-size:1.25rem}
summary::-webkit-details-marker{display:none}summary svg{color:var(--terra);flex:none;transition:transform .25s}
details[open] summary svg{transform:rotate(180deg)}
details p{color:var(--olive-soft);font-size:.95rem;padding:0 0 1.25rem}
/* RSVP */
.formcard{background:var(--card);border:1px solid rgba(223,228,218,.7);border-radius:14px;padding:1.5rem;box-shadow:0 4px 18px rgba(42,72,30,.05)}
@media(min-width:640px){.formcard{padding:2.25rem}}
form.rsvp{display:grid;gap:1.4rem}
label.f,.lbl{display:grid;gap:.45rem;font-size:.9rem;font-weight:500;color:var(--olive)}
label.f .req,.lbl .req{color:var(--terra)}
input,select,textarea{font:inherit;font-size:1rem;font-weight:400;color:var(--olive);background:var(--parchment);border:1px solid var(--mist);border-radius:8px;padding:.75rem .9rem;width:100%}
input::placeholder,textarea::placeholder{color:#8a937f}
input:focus,select:focus,textarea:focus{outline:2px solid rgba(208,97,57,.45);outline-offset:1px;border-color:transparent}
.two{display:grid;gap:1rem}@media(min-width:560px){.two{grid-template-columns:1fr 1fr}}
.choice{display:grid;gap:.6rem}@media(min-width:560px){.choice{grid-template-columns:1fr 1fr}}
.choice label,.evt{display:flex;align-items:center;gap:.75rem;border:1px solid var(--mist);background:var(--parchment);border-radius:8px;padding:.85rem 1rem;cursor:pointer;font-size:.95rem}
.choice input,.evt input[type=checkbox]{width:1.15rem;height:1.15rem;accent-color:var(--terra);flex:none;margin:0}
.choice label:has(input:checked),.evt:has(input:checked){border-color:var(--terra);background:rgba(208,97,57,.06)}
.evts{display:grid;gap:.6rem}
.evt .grow{flex:1;display:grid}.evt .grow b{font-family:var(--title);font-weight:500;font-size:1.15rem}.evt .grow small{font-size:.8rem;color:var(--olive-soft)}
.evt input[type=number]{width:4.2rem;text-align:center;padding:.5rem;background:var(--card)}
.hint{font-size:.85rem;color:var(--olive-soft)}
.err{background:rgba(192,57,43,.08);border:1px solid rgba(192,57,43,.4);border-radius:8px;padding:.8rem 1rem;color:#7d2a1f}
.send{width:100%;padding:.95rem 1.5rem;font-size:1rem}
.recap{list-style:none;padding:1rem 1.25rem;margin:1.5rem 0;border-radius:10px;background:var(--deep);text-align:left}
.recap li{display:flex;justify-content:space-between;gap:1rem;padding:.3rem 0;font-size:.95rem}
/* Pied de page */
footer{border-top:1px solid rgba(223,228,218,.6);background:var(--deep);text-align:center;padding:3rem 1.25rem}
footer .n{font-family:var(--title);font-size:1.9rem;font-weight:500}
footer .d{font-size:.9rem;color:var(--olive-soft);margin-top:.4rem}
footer .p{display:flex;align-items:center;justify-content:center;gap:.35rem;font-size:.9rem;color:var(--olive-soft);margin-top:.35rem}.p svg{color:var(--terra)}
footer .adm{display:inline-block;margin-top:1.25rem;padding:.6rem 1rem;font-size:.75rem;letter-spacing:.25em;text-transform:uppercase;color:var(--muted);text-decoration:none}
footer .adm:hover{color:var(--terra-deep)}
/* Écran d'entrée */
.splash{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 1.5rem;min-height:100svh}
.splash .kicker{color:var(--olive-soft)}
.splash h1{font-size:clamp(3.4rem,11vw,6rem);font-weight:500;line-height:1.05;margin:.6rem 0 0}
@media(max-width:560px){.splash h1 .amp{display:block}}
.splash hr{width:8rem;border:0;border-top:1px solid #CFCBC1;margin:2.2rem auto}
.splash .date{font-family:var(--title);font-size:1.75rem;color:var(--olive-soft)}
.splash .place{font-size:.95rem;color:#56614e;margin-top:.3rem}
.enter{display:inline-flex;align-items:center;gap:.6rem;margin-top:3rem;font-family:var(--title);font-size:1.3rem;color:var(--terra-deep);text-decoration:none;border:1px solid rgba(208,97,57,.45);background:rgba(208,97,57,.08);border-radius:999px;padding:.8rem 2.5rem;transition:background .2s}
.enter:hover{background:rgba(208,97,57,.15)}
.splash.photo{position:relative;isolation:isolate;overflow:hidden}
.splash .bg{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;transform:scale(1.04);animation:drift 24s ease-out both}
.splash .voile{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse 62% 55% at 50% 50%,rgba(250,248,245,.9) 0%,rgba(248,243,234,.8) 55%,rgba(240,230,212,.66) 100%)}
@media(max-width:640px){.splash .voile{background:radial-gradient(ellipse 95% 60% at 50% 50%,rgba(250,248,245,.9) 0%,rgba(248,243,234,.82) 60%,rgba(240,230,212,.7) 100%)}}
.splash.photo .enter{background:rgba(250,248,245,.75)}.splash.photo .enter:hover{background:rgba(250,248,245,.95)}
.splash.photo hr{border-top-color:rgba(79,100,64,.35)}
@keyframes drift{from{transform:scale(1.1)}to{transform:scale(1.04)}}
@media(prefers-reduced-motion:reduce){.splash .bg{animation:none}}
.reveal{opacity:0;transform:translateY(18px);transition:opacity .8s ease,transform .8s ease}.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}}
`

const Names = ({ w }: { w: WeddingConfig }) => (
  <>
    {w.partner1} <span class="amp">&amp;</span> {w.partner2}
  </>
)

// Numéros de téléphone français cliquables
const withPhones = (s: string) =>
  s.split(/((?:\+33\s?|0)[1-9](?:[\s.]?\d{2}){4})/).map((part, i) => (i % 2 ? <a href={`tel:${part.replace(/[\s.]/g, '')}`}>{part}</a> : part))

const mapsUrl = (q: string) => ({
  google: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`,
  waze: `https://waze.com/ul?q=${encodeURIComponent(q)}`,
  apple: `https://maps.apple.com/?q=${encodeURIComponent(q)}`,
  embed: `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=14&output=embed`,
})

const accessIcon: Record<string, string> = { car: 'car', parking: 'parking', train: 'train', plane: 'plane' }

function Shell({ w, title, children, bare }: { w: WeddingConfig; title: string; children: Child; bare?: boolean }) {
  return (
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <title>{title}</title>
        <meta name="description" content={w.seo.description} />
        <meta name="theme-color" content="#FAF8F5" />
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
        <style>{raw(css + ampCss(w.theme))}</style>
      </head>
      <body>
        {children}
        {!bare && <script>{raw(siteScript)}</script>}
      </body>
    </html>
  )
}

function Layout({ w, page, k, title, children }: { w: WeddingConfig; page?: ClassicPage; k: string; title: string; children: Child }) {
  const q = k ? `?k=${encodeURIComponent(k)}` : ''
  const c = w.classic ?? {}
  const items: [ClassicPage, string][] = [['accueil', 'Accueil'], ['lieu', 'Le lieu'], ['programme', 'Programme'], ['infos', 'Infos pratiques'], ['rsvp', 'RSVP']]
  return (
    <Shell w={w} title={title}>
      <header class="top">
        <nav class="nav" id="nav">
          <a class="logo" href={`/accueil${q}`}><Names w={w} /></a>
          <button class="burger" type="button" aria-label="Ouvrir le menu" data-burger><Svg name="menu" size={24} /></button>
          <ul class="links">
            {items.map(([p, l]) => <li><a href={`/${p}${q}`} aria-current={p === page ? 'page' : undefined}>{l}</a></li>)}
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <div class="n"><Names w={w} /></div>
        <p class="d">{w.dateLabel}</p>
        {c.footerPlace && <p class="p"><Svg name="pin" size={15} /> {c.footerPlace}</p>}
        <a class="adm" href="/espace-maries">Espace mariés</a>
      </footer>
    </Shell>
  )
}

export function Splash({ w, k }: { w: WeddingConfig; k: string }) {
  const c = w.classic ?? {}
  return (
    <Shell w={w} title={w.seo.title} bare>
      <div class={`splash${w.splash.image ? ' photo' : ''}`}>
        {w.splash.image && <img class="bg" src={w.splash.image} alt="" aria-hidden="true" fetchpriority="high" style={w.splash.imagePosition ? `object-position:${w.splash.imagePosition}` : undefined} />}
        {w.splash.image && <div class="voile" aria-hidden="true"></div>}
        <p class="kicker">{w.splash.kicker ?? 'Nous nous marions'}</p>
        <h1>{w.partner1} <span class="amp">&amp;</span> {w.partner2}</h1>
        <hr />
        <p class="date">{c.weddingDay ?? w.dateLabel}</p>
        <p class="place">{c.venueLine ?? w.place}</p>
        <a class="enter" href={`/accueil${k ? `?k=${encodeURIComponent(k)}` : ''}`}>Entrer <Svg name="chevron" size={18} /></a>
      </div>
    </Shell>
  )
}

export function Accueil({ w, k, visible }: { w: WeddingConfig; k: string; visible: WeddingEvent[] }) {
  const c = w.classic ?? {}
  const q = k ? `?k=${encodeURIComponent(k)}` : ''
  const days = [...new Set(visible.map((e) => e.day.split(' ')[0]))].map((d, i) => (i ? d.toLowerCase() : d))
  const tiles: [string, string, string, string][] = [
    ['lieu', 'pin', 'Le lieu', w.venues[0]?.name ?? ''],
    ['programme', 'calendar', 'Le programme', days.join(' & ')],
    ['infos', 'sparkles2', 'Infos pratiques', 'Dress code, hôtels'],
    ['rsvp', 'send', 'RSVP', w.rsvp.deadlineLabel ? `Répondez avant le ${w.rsvp.deadlineLabel}` : 'Répondez à l’invitation'],
  ]
  return (
    <Layout w={w} page="accueil" k={k} title={w.seo.title}>
      <section class="hero">
        {w.hero.photo && <img src={w.hero.photo} alt={`${w.partner1} et ${w.partner2}`} style={w.hero.photoPosition ? `object-position:${w.hero.photoPosition}` : undefined} />}
        <div class="txt">
          <p>{w.hero.kicker ?? `${c.weddingDay ?? w.dateLabel} · ${w.place}`}</p>
          <h1><Names w={w} /></h1>
        </div>
      </section>
      <section class="soon">
        <div class="narrow">
          <p class="kicker">Le grand jour approche</p>
          <h2>Dans combien de temps ?</h2>
          <div class="countdown" data-countdown={w.dateISO}>
            {['Jours', 'Heures', 'Minutes', 'Secondes'].map((u, i) => (
              <>
                {i > 0 && <i aria-hidden="true">:</i>}
                <div><b data-u={i}>--</b><small>{u}</small></div>
              </>
            ))}
          </div>
        </div>
      </section>
      {w.quote && (
        <section class="quote">
          <div class="narrow reveal">
            <p>« {w.quote} »</p>
            <p class="sig">— {w.partner1} <span class="amp">&amp;</span> {w.partner2}</p>
          </div>
        </section>
      )}
      <section class="deep">
        <div class="wrap tiles">
          {tiles.map(([p, icon, t, s]) => (
            <a class="tile" href={`/${p}${q}`}><span class="ico"><Svg name={icon} /></span><h3>{t}</h3><span class="s">{s}</span></a>
          ))}
        </div>
      </section>
      {c.banner && (
        <section class="banner">
          <img src={c.banner.image} alt="" loading="lazy" />
          <p>« {c.banner.text} »</p>
        </section>
      )}
    </Layout>
  )
}

export function Lieu({ w, k, visible }: { w: WeddingConfig; k: string; visible: WeddingEvent[] }) {
  const c = w.classic ?? {}
  const keys = visible.map((e) => e.key)
  const venues = w.venues.filter((v) => !v.onlyForEvents || v.onlyForEvents.some((x) => keys.includes(x)))
  const main = venues[0]
  return (
    <Layout w={w} page="lieu" k={k} title={`Le lieu · ${w.seo.title}`}>
      <section class="vhero">
        {c.venueImage && <img src={c.venueImage} alt={main ? `Vue aérienne de ${main.name}` : ''} />}
        <p class="kicker">Le lieu</p>
        <h1>{main?.name ?? 'Le lieu'}</h1>
      </section>
      {venues.map((v) => {
        const m = mapsUrl(`${v.name}, ${v.address}`)
        return (
          <section class="venue">
            <div class="narrow">
              {v.description && <p class="desc">{v.description}</p>}
              <p class="name"><Svg name="pin" size={18} /> {v.name}</p>
              <p class="addr">{v.address}</p>
              <a class="btn" href={m.google} target="_blank" rel="noopener"><Svg name="navigation" size={16} /> Itinéraire</a>
              <div class="more">
                <a class="ghost" href={m.waze} target="_blank" rel="noopener">Waze</a>
                <a class="ghost" href={m.apple} target="_blank" rel="noopener">Apple Plans</a>
              </div>
            </div>
            <div class="wrap" style="max-width:48rem">
              <iframe class="map" title={`Carte : ${v.name}`} src={m.embed} loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
            </div>
          </section>
        )
      })}
      {!!w.access?.length && (
        <section class="sec deep">
          <div class="wrap" style="max-width:48rem">
            <h2>Comment s'y rendre</h2>
            <div class="cards two">
              {w.access.map((a) => (
                <div class="card row"><span class="ico" style="width:2.6rem;height:2.6rem"><Svg name={accessIcon[a.icon ?? ''] ?? 'info'} size={19} /></span><div><h3>{a.title}</h3><p style="margin-top:.35rem">{a.text}</p></div></div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  )
}

export function Programme({ w, k, visible }: { w: WeddingConfig; k: string; visible: WeddingEvent[] }) {
  const c = w.classic ?? {}
  const days = [...new Set(visible.map((e) => e.day))]
  const tbc = !!w.programme?.provisional
  return (
    <Layout w={w} page="programme" k={k} title={`Programme · ${w.seo.title}`}>
      <section class="phead">
        <div class="narrow">
          <p class="kicker">Le programme</p>
          <h1>{w.programme?.title ?? 'Le programme'}</h1>
          {w.programme?.intro && <p class="lead">{w.programme.intro}</p>}
          {tbc && <span class="pill">✦ Programme provisoire</span>}
        </div>
      </section>
      {days.map((day) => (
        <section class="day">
          <div class="narrow">
            <div class="sh"><Svg name="moon" size={20} /><h2>{day}</h2></div>
            <ul class="tl">
              {visible.filter((e) => e.day === day).map((e) => (
                <li class="reveal">
                  <span class="dot"><Svg name={e.icon ?? 'flower'} size={19} /></span>
                  <div>
                    <div class="when"><span class="time">{e.time}</span>{tbc && <span class="tbc">à confirmer</span>}</div>
                    <h4>{e.title}</h4>
                    {e.note && <p>{e.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      {c.scheduleNote && <p class="note narrow" style="padding-bottom:4rem;max-width:30rem">{c.scheduleNote}</p>}
    </Layout>
  )
}

export function Infos({ w, k }: { w: WeddingConfig; k: string }) {
  const dc = w.infos?.dressCode
  const blocks = w.infos?.blocks ?? []
  return (
    <Layout w={w} page="infos" k={k} title={`Infos pratiques · ${w.seo.title}`}>
      <section class="phead">
        <div class="narrow">
          <p class="kicker">Informations pratiques</p>
          <h1>Pour bien préparer votre venue</h1>
        </div>
      </section>
      <section style="padding-bottom:2rem">
        <div class="wrap cards two">
          {dc && <div class="card big"><span class="ico"><Svg name="shirt" /></span><h3>Dress code</h3><p class="t">{dc.text}</p></div>}
          {blocks.map((b) => <div class="card big"><span class="ico"><Svg name={/enfant/i.test(b.title) ? 'baby' : 'info'} /></span><h3>{b.title}</h3><p class="t">{b.text}</p></div>)}
        </div>
      </section>
      {!!w.hotels?.length && (
        <section class="sec">
          <div class="wrap">
            <div class="sh"><Svg name="hotel" size={20} /><h2>Hôtels à proximité</h2></div>
            <div class="cards two">
              {w.hotels.map((h) => (
                <div class="card hotel reveal">
                  <h3>{h.name}</h3>
                  {h.place && <span class="pill">{h.place}</span>}
                  {h.text && <p class="t lead">{withPhones(h.text)}</p>}
                  {!!h.lines?.length && (
                    <ul class="lines">
                      {h.lines.map((l) => <li><span class="li-ico"><Svg name={l.icon} size={16} /></span><span>{withPhones(l.text)}</span></li>)}
                    </ul>
                  )}
                  {h.url && <a class="web" href={h.url} target="_blank" rel="noopener">Site de l'hôtel →</a>}
                </div>
              ))}
            </div>
            {w.hotelsNote && <p class="note">{w.hotelsNote}</p>}
          </div>
        </section>
      )}
      {!!w.faq?.length && (
        <section class="sec deep">
          <div class="narrow">
            <h2>Questions fréquentes</h2>
            {w.faq.map((f) => <details><summary>{f.q}<Svg name="chevron" size={20} /></summary><p>{f.a}</p></details>)}
          </div>
        </section>
      )}
    </Layout>
  )
}

export function RsvpPage({ w, k, visible, existing, error }: { w: WeddingConfig; k: string; visible: WeddingEvent[]; existing?: Rsvp | null; error?: string }) {
  const r = w.rsvp
  const ev = existing ? eventsOf(existing) : {}
  const absent = existing ? !!existing.absent : false
  const editing = !!existing?.token
  const party = Math.max(1, ...Object.values(ev))
  return (
    <Layout w={w} page="rsvp" k={k} title={`RSVP · ${w.seo.title}`}>
      <section class="phead" style="padding-bottom:2.5rem">
        <div class="narrow">
          <p class="kicker">Réponse attendue</p>
          <h1>{editing ? 'Modifier ma réponse' : 'Répondez à l’invitation'}</h1>
          {r.deadlineLabel && <p class="lead">Merci de confirmer votre présence avant le <strong>{r.deadlineLabel}</strong>. Cochez les moments auxquels vous assisterez.</p>}
        </div>
      </section>
      <section style="padding-bottom:5rem">
        <div class="narrow" style="max-width:36rem">
          <div class="formcard">
            <form class="rsvp" method="post" action="/rsvp" data-rsvp>
              {error && <p class="err">{error}</p>}
              <input type="hidden" name="k" value={k} />
              {editing && <input type="hidden" name="token" value={existing!.token} />}
              <div class="two">
                <label class="f"><span>Prénom <span class="req">*</span></span><input name="prenom" required maxlength={80} autocomplete="given-name" placeholder="Votre prénom" value={existing?.prenom ?? ''} /></label>
                <label class="f"><span>Nom <span class="req">*</span></span><input name="nom" required maxlength={80} autocomplete="family-name" placeholder="Votre nom" value={existing?.nom ?? ''} /></label>
              </div>
              {r.askEmail && <label class="f"><span>Email <span class="req">*</span></span><input name="email" type="email" required maxlength={160} autocomplete="email" value={existing?.email ?? ''} /></label>}
              <div class="lbl"><span>Serez-vous des nôtres ? <span class="req">*</span></span>
                <div class="choice">
                  <label><input type="radio" name="presence" value="oui" required checked={existing ? !absent : false} /> Je serai présent(e)</label>
                  <label><input type="radio" name="presence" value="non" checked={absent} /> Je ne pourrai pas venir</label>
                </div>
              </div>
              <div data-when-present><div style="display:grid;gap:1.4rem">
                {r.perEvent ? (
                  <>
                    <label class="f">Nombre de participants (vous inclus)
                      <input type="number" name="participants" min={1} max={r.maxPersons} value={party} inputmode="numeric" data-participants />
                    </label>
                    <div class="lbl"><span>Moments <span class="req">*</span></span>
                      <p class="hint" style="font-weight:400">Le nombre de personnes est reporté sur chaque moment et reste modifiable.</p>
                      <div class="evts">
                        {visible.filter((e) => !e.noRsvp).map((e) => (
                          <label class="evt">
                            <input type="checkbox" name="evt" value={e.key} checked={!!ev[e.key]} />
                            <span class="grow"><b>{e.title}</b><small>{e.day} · {e.time}</small></span>
                            <input type="number" name={`nb_${e.key}`} min={1} max={r.maxPersons} value={ev[e.key] || party} aria-label={`Nombre de personnes pour ${eventLabel(w, e)}`} inputmode="numeric" />
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <label class="f">Nombre de personnes (vous inclus)
                    <select name="guests">
                      {Array.from({ length: r.maxPersons }, (_, i) => i + 1).map((n) => <option value={n} selected={(existing?.guests || 1) === n}>{n} {n > 1 ? 'personnes' : 'personne'}</option>)}
                    </select>
                  </label>
                )}
                {r.askCompanions && <label class="f">Accompagnants<input name="companions" maxlength={300} placeholder="Prénoms de vos accompagnants" value={existing?.companions ?? ''} /></label>}
                {r.askDietary && <label class="f">Restrictions alimentaires / allergies<textarea name="dietary" rows={2} maxlength={500} placeholder="Végétarien, sans gluten, allergies…">{existing?.dietary ?? ''}</textarea></label>}
              </div></div>
              <label class="f">Message aux mariés<textarea name="message" rows={3} maxlength={2000} placeholder={`Un petit mot pour ${w.partner1} & ${w.partner2}…`}>{existing?.message ?? ''}</textarea></label>
              <input type="text" name="site_web" tabindex={-1} autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true" />
              <button class="btn send" type="submit"><Svg name="send" size={17} /> {editing ? 'Enregistrer les modifications' : 'Envoyer ma réponse'}</button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export function ClassicThanks({ w, rsvp, events, k }: { w: WeddingConfig; rsvp: Rsvp; events: WeddingEvent[]; k: string }) {
  const ev = eventsOf(rsvp)
  const q = k ? `k=${encodeURIComponent(k)}&` : ''
  return (
    <Layout w={w} page="rsvp" k={k} title={`Merci · ${w.seo.title}`}>
      <section class="phead">
        <div class="narrow" style="max-width:34rem">
          <p class="kicker">Réponse enregistrée</p>
          <h1>Merci{rsvp.prenom ? ` ${rsvp.prenom}` : ''} !</h1>
          <ul class="recap">
            {rsvp.absent ? (
              <li>Vous ne pourrez malheureusement pas être présent(e). Vous nous manquerez !</li>
            ) : w.rsvp.perEvent ? (
              events.filter((e) => ev[e.key]).map((e) => <li><span>{eventLabel(w, e)} · {e.time}</span><strong>{ev[e.key]} pers.</strong></li>)
            ) : (
              <li><span>Présence confirmée</span><strong>{rsvp.guests} pers.</strong></li>
            )}
          </ul>
          {w.rsvp.thanks && !rsvp.absent && <p class="lead" style="margin-top:0">{w.rsvp.thanks}</p>}
          <p class="hint" style="margin-top:1.5rem">Gardez ce lien pour modifier votre réponse plus tard :</p>
          <p style="margin:.4rem 0 2rem"><a href={`/rsvp?${q}modifier=${rsvp.token}`} style="color:var(--terra-deep);font-weight:500">Modifier ma réponse</a></p>
          <a class="btn" href={`/accueil${k ? `?k=${encodeURIComponent(k)}` : ''}`}>Retour au site</a>
        </div>
      </section>
    </Layout>
  )
}
