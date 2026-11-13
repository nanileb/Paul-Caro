import type { WeddingConfig } from './config'

export const fontsHref = (t: WeddingConfig['theme']) =>
  'https://fonts.googleapis.com/css2?' +
  [t.fontTitle, t.fontScript, t.fontBody]
    .filter(Boolean)
    .map((f) => `family=${f!.replace(/ /g, '+')}${f === t.fontScript ? '' : ':ital,wght@0,300;0,400;0,500;0,600;1,400'}`)
    .join('&') + '&display=swap'

export const css = (t: WeddingConfig['theme']) => `
:root{--bg:${t.background};--surface:${t.surface};--text:${t.text};--primary:${t.primary};--accent:${t.accent};--hero:${t.heroText};
--title:'${t.fontTitle}',Georgia,serif;--script:${t.fontScript ? `'${t.fontScript}',cursive` : `'${t.fontTitle}',Georgia,serif`};--body:'${t.fontBody}',system-ui,sans-serif;
--line:color-mix(in srgb,var(--text) 14%,transparent);--soft:color-mix(in srgb,var(--text) 70%,transparent)}
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:4.5rem}
body{margin:0;font-family:var(--body);font-weight:300;background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:var(--title);font-weight:400;line-height:1.15;margin:0 0 .6em}
a{color:inherit}img{max-width:100%}
.kicker{font-size:.72rem;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);margin:0 0 .8rem}
.script{font-family:var(--script)}
.amp{font-family:var(--script);color:var(--accent);font-style:italic;padding:0 .15em}
.btn{display:inline-flex;align-items:center;gap:.5rem;font:inherit;font-weight:500;font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;
  background:var(--primary);color:var(--bg);border:1px solid var(--primary);border-radius:999px;padding:.85rem 1.9rem;cursor:pointer;text-decoration:none;transition:.3s}
.btn:hover{background:var(--accent);border-color:var(--accent)}
.btn.ghost{background:transparent;color:inherit;border-color:currentColor}.btn.ghost:hover{background:color-mix(in srgb,currentColor 12%,transparent)}
.btn.small{padding:.5rem 1rem;font-size:.72rem}
.bgfix{position:fixed;inset:0;z-index:-1;overflow:hidden;background:var(--bg)}
.bgfix img,.bgfix video,.splash video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bgfix .veil,.splash .veil{position:absolute;inset:0;background:${t.overlay ?? 'transparent'}}
/* Écran d'entrée */
.splash{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--hero);background:var(--bg);padding:2rem;transition:opacity .9s ease,visibility .9s}
.splash.gone{opacity:0;visibility:hidden}
.splash .inner{position:relative;max-width:40rem;animation:rise 1.2s ease both}
.splash h1{font-family:var(--script);font-size:clamp(3.4rem,14vw,7.5rem);margin:.2rem 0}
.splash p{margin:.3rem 0 1.8rem;opacity:.9}
@keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
/* Navigation */
.nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:.9rem 1.25rem;color:var(--hero);transition:.4s}
.nav.solid{background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(10px);color:var(--text);box-shadow:0 1px 0 var(--line)}
.nav .mono{font-family:var(--script);font-size:1.6rem;text-decoration:none}
.nav ul{display:flex;gap:.25rem;list-style:none;margin:0;padding:0}
.nav ul a{text-decoration:none;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;padding:.5rem .7rem;border-radius:999px;opacity:.85}
.nav ul a:hover{opacity:1;color:var(--accent)}
.nav .burger{display:none;background:none;border:0;color:inherit;cursor:pointer;padding:.3rem}
@media(max-width:820px){.nav .burger{display:block}.nav ul{display:none;position:absolute;top:100%;left:.75rem;right:.75rem;flex-direction:column;background:var(--bg);color:var(--text);border-radius:16px;padding:.5rem;box-shadow:0 10px 30px rgba(0,0,0,.2)}
  .nav.open ul{display:flex}.nav ul a{display:block;padding:.85rem 1rem;font-size:.85rem}}
/* Accueil */
.hero{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--hero);padding:6rem 1.25rem 4rem;position:relative}
.hero .mono-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--script);font-size:clamp(10rem,40vw,26rem);opacity:.05;pointer-events:none;white-space:nowrap}
.hero h1{font-family:var(--script);font-size:clamp(3.6rem,13vw,8.5rem);margin:.2rem 0 .4rem;text-shadow:0 2px 24px rgba(0,0,0,.25)}
.hero .date{font-family:var(--title);font-size:clamp(1.3rem,3.5vw,1.9rem);font-style:italic}
.hero .place{letter-spacing:.25em;text-transform:uppercase;font-size:.75rem;opacity:.85;margin-top:.3rem}
.countdown{display:flex;gap:.6rem;justify-content:center;margin:2.2rem 0 2.4rem;flex-wrap:wrap}
.countdown div{min-width:4.6rem;padding:.8rem .6rem;border-radius:16px;background:rgba(0,0,0,.18);border:1px solid color-mix(in srgb,var(--c,var(--hero)) 45%,transparent);backdrop-filter:blur(6px)}
.countdown b{display:block;font-family:var(--title);font-weight:500;font-size:clamp(1.6rem,6vw,2.6rem);line-height:1;color:var(--c,var(--hero));font-variant-numeric:tabular-nums}
.countdown small{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;opacity:.85}
.today{font-family:var(--script);font-size:2.6rem;color:var(--accent);margin:2rem 0}
/* Sections */
main section{padding:5.5rem 1.25rem;position:relative}
.wrap{max-width:62rem;margin:0 auto}.narrow{max-width:40rem;margin:0 auto}
.card{background:var(--surface);color:var(--text);border:1px solid var(--line);border-radius:22px;padding:2rem;box-shadow:0 10px 40px rgba(0,0,0,.06)}
.panel{background:var(--surface);border:1px solid var(--line);border-radius:28px;padding:clamp(1.5rem,4vw,3rem);backdrop-filter:blur(10px)}
.head{text-align:center;margin-bottom:2.5rem}.head h2{font-size:clamp(2.2rem,6vw,3.4rem)}
.head .rule{display:flex;align-items:center;justify-content:center;gap:.8rem;color:var(--accent)}.head .rule:before,.head .rule:after{content:"";height:1px;width:3rem;background:currentColor;opacity:.6}
.grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))}
.lead{font-size:1.08rem;text-align:center;color:var(--soft)}
.quote{font-family:var(--title);font-style:italic;font-size:clamp(1.35rem,3.5vw,1.9rem);text-align:center;line-height:1.5}
.sign{font-family:var(--script);font-size:1.8rem;color:var(--accent);text-align:center;margin-top:1rem}
/* Programme */
.day{margin-bottom:2.5rem}.day>h3{font-size:1.6rem;text-align:center;color:var(--accent);font-style:italic}
.timeline{list-style:none;margin:0 auto;padding:0;max-width:36rem;position:relative}
.timeline:before{content:"";position:absolute;left:1.6rem;top:.5rem;bottom:.5rem;width:1px;background:var(--line)}
.timeline li{display:flex;gap:1.2rem;align-items:flex-start;padding:.8rem 0;position:relative}
.timeline .ico{flex:none;width:3.2rem;height:3.2rem;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--bg);border:1.5px solid var(--primary);color:var(--primary);z-index:1}
.timeline .time{font-family:var(--title);font-size:1.5rem;color:var(--accent);line-height:1.2}
.timeline .t{font-family:var(--title);font-size:1.3rem}
.timeline .n{font-size:.9rem;color:var(--soft)}
.badge{display:inline-block;font-size:.7rem;letter-spacing:.15em;text-transform:uppercase;border:1px solid var(--accent);color:var(--accent);border-radius:999px;padding:.25rem .8rem}
/* Lieux */
.venue{margin-bottom:2rem}.venue h3{font-size:1.8rem;margin-bottom:.2rem}
.addr{display:flex;gap:.5rem;align-items:flex-start;color:var(--soft)}
.map{width:100%;height:320px;border:0;border-radius:16px;margin:1.2rem 0 1rem;filter:saturate(.9)}
.links{display:flex;flex-wrap:wrap;gap:.5rem}
.icard{display:flex;gap:1rem;align-items:flex-start}.icard .ic{color:var(--primary);flex:none;margin-top:.2rem}
.icard h4{font-size:1.3rem;margin:0 0 .3rem}
.swatches{display:flex;flex-wrap:wrap;gap:1rem;margin-top:1.2rem}
.swatches div{display:flex;flex-direction:column;align-items:center;gap:.35rem;font-size:.75rem}
.swatches span{width:2.6rem;height:2.6rem;border-radius:50%;border:2px solid rgba(255,255,255,.7);box-shadow:0 2px 8px rgba(0,0,0,.15)}
details{border-bottom:1px solid var(--line);padding:1.1rem 0}
summary{cursor:pointer;font-family:var(--title);font-size:1.25rem;list-style:none;display:flex;justify-content:space-between;gap:1rem}
summary:after{content:"+";color:var(--accent)}details[open] summary:after{content:"–"}
details p{color:var(--soft);margin:.6rem 0 0}
/* Formulaire */
form.rsvp{display:grid;gap:1.3rem}
label.f{display:grid;gap:.4rem;font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--soft)}
input,select,textarea{font:inherit;font-size:1rem;letter-spacing:normal;text-transform:none;color:var(--text);background:color-mix(in srgb,var(--bg) 70%,transparent);
  border:1px solid var(--line);border-radius:12px;padding:.8rem 1rem;width:100%}
input:focus,select:focus,textarea:focus{outline:2px solid color-mix(in srgb,var(--primary) 60%,transparent);border-color:transparent}
.two{display:grid;gap:1rem;grid-template-columns:1fr 1fr}@media(max-width:560px){.two{grid-template-columns:1fr}}
.choice{display:flex;gap:.8rem;flex-wrap:wrap}
.choice label,.evt{display:flex;align-items:center;gap:.7rem;border:1px solid var(--line);border-radius:14px;padding:.85rem 1rem;cursor:pointer;flex:1;min-width:12rem}
.choice input,.evt input[type=checkbox]{width:1.15rem;height:1.15rem;accent-color:var(--primary);flex:none}
.choice label:has(input:checked),.evt:has(input:checked){border-color:var(--primary);background:color-mix(in srgb,var(--primary) 10%,transparent)}
.evt .grow{flex:1;display:grid}.evt .grow b{font-weight:500}.evt .grow small{color:var(--soft)}
.evt input[type=number]{width:4.5rem;text-align:center;padding:.5rem}
.evts{display:grid;gap:.6rem}
.hint{font-size:.85rem;color:var(--soft)}
.err{background:#c0392b1a;border:1px solid #c0392b66;color:inherit;border-radius:12px;padding:.8rem 1rem}
.ok{text-align:center}.ok h2{font-family:var(--script);font-size:3.2rem;color:var(--accent)}
.recap{list-style:none;padding:1rem 1.25rem;margin:1.2rem 0;border-radius:14px;background:color-mix(in srgb,var(--primary) 8%,transparent);text-align:left}
.recap li{display:flex;justify-content:space-between;gap:1rem;padding:.25rem 0}
[data-when-absent]{transition:.3s}
footer{text-align:center;padding:3.5rem 1rem 6rem;color:var(--soft)}
footer .names{font-family:var(--script);font-size:2.4rem;color:var(--text)}
footer a{font-size:.75rem;opacity:.7}
.music{position:fixed;right:1.1rem;bottom:calc(1.1rem + env(safe-area-inset-bottom));z-index:60;width:3rem;height:3rem;border-radius:50%;border:1px solid var(--line);
  background:color-mix(in srgb,var(--bg) 80%,transparent);backdrop-filter:blur(8px);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.2)}
.reveal{opacity:0;transform:translateY(24px);transition:opacity .9s ease,transform .9s ease}.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}html{scroll-behavior:auto}}
.on-image main section{color:var(--text)}
`

// Feuille de style de l'espace mariés (sobre, indépendante du thème du site)
export const adminCss = `
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f5f4f1;color:#222;font-size:15px}
a{color:#0b6e75}h1,h2,h3{margin:0 0 .6rem;font-weight:600}
.top{background:#1d2b2e;color:#fff;padding:1rem 1.25rem;display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between}
.top a{color:#fff}.top small{opacity:.7;display:block}
.wrap{max-width:1200px;margin:0 auto;padding:1.25rem}
.kpis{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:1.25rem}
.kpi{background:#fff;border-radius:14px;padding:1rem;border:1px solid #e6e3dc}.kpi b{display:block;font-size:1.9rem;color:#0b6e75}.kpi span{font-size:.8rem;color:#666}
.tabs{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1rem}
.tabs a{padding:.55rem 1rem;border-radius:999px;background:#fff;border:1px solid #e6e3dc;text-decoration:none;color:#333;font-size:.9rem}
.tabs a.on{background:#1d2b2e;color:#fff;border-color:#1d2b2e}
.box{background:#fff;border-radius:14px;border:1px solid #e6e3dc;padding:1rem;margin-bottom:1rem}
.bar{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:1rem}
input,select,textarea,button{font:inherit}input,select,textarea{padding:.55rem .75rem;border:1px solid #d6d2c8;border-radius:10px;background:#fff}
.btn{display:inline-block;padding:.55rem 1rem;border-radius:999px;border:1px solid #1d2b2e;background:#1d2b2e;color:#fff;text-decoration:none;cursor:pointer;font-size:.88rem}
.btn.light{background:#fff;color:#1d2b2e}.btn.red{background:#b3261e;border-color:#b3261e}.btn.sm{padding:.3rem .7rem;font-size:.8rem}
.scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.88rem}
th,td{padding:.55rem .6rem;border-bottom:1px solid #eee;text-align:left;vertical-align:top}th{background:#faf9f6;font-weight:600;white-space:nowrap}
td.c,th.c{text-align:center}.yes{color:#0b6e75;font-weight:600}.no{color:#b3261e}.muted{color:#888}
.pill{display:inline-block;padding:.1rem .55rem;border-radius:999px;font-size:.75rem;background:#eef4f4;color:#0b6e75}
.pill.wait{background:#fdf0e6;color:#b25b16}.pill.warn{background:#fde8e8;color:#b3261e}
.cols{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.list{list-style:none;margin:0;padding:0}.list li{display:flex;justify-content:space-between;gap:1rem;padding:.35rem 0;border-bottom:1px solid #f0eee9}
.flash{background:#e7f4ee;border:1px solid #bfe3cf;border-radius:10px;padding:.7rem 1rem;margin-bottom:1rem}
.login{max-width:360px;margin:12vh auto;background:#fff;border-radius:18px;padding:2rem;border:1px solid #e6e3dc;text-align:center}
.login input{width:100%;margin:1rem 0}
.copy{display:flex;gap:.5rem;margin:.3rem 0 1rem}.copy input{flex:1;min-width:0}
dialog{border:0;border-radius:16px;padding:1.5rem;max-width:min(680px,95vw);width:100%}dialog::backdrop{background:rgba(0,0,0,.45)}
.qr{display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start}.qr .code{width:220px;height:220px;background:#fff;padding:8px;border:1px solid #eee;border-radius:12px}
.qr .code svg{width:100%;height:100%}
`
