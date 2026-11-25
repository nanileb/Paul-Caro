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
.hero.with-photo{gap:1.6rem}
.hero-photo{margin:0;width:min(68vw,380px);aspect-ratio:4/5;border-radius:999px 999px 28px 28px;overflow:hidden;border:4px solid color-mix(in srgb,var(--hero) 85%,transparent);box-shadow:0 18px 50px rgba(0,0,0,.35)}
.hero-photo img{width:100%;height:100%;object-fit:cover;object-position:center 25%;display:block}
@media (min-width:900px){.hero.with-photo{flex-direction:row-reverse;gap:clamp(2.5rem,6vw,6rem)}.hero.with-photo .hero-photo{width:min(30vw,420px)}}
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

// Feuille de style de l'espace mariés : reprend la palette et les polices du site
export const adminCss = (t: WeddingConfig['theme']) => `
:root{--bg:${t.background};--card:${t.surface};--text:${t.text};--primary:${t.primary};--accent:${t.accent};
--title:'${t.fontTitle}',Georgia,serif;--body:'${t.fontBody}',system-ui,sans-serif;
--deep:color-mix(in srgb,var(--primary) 78%,#000);--soft:color-mix(in srgb,var(--text) 72%,var(--bg));--muted:color-mix(in srgb,var(--text) 55%,var(--bg));
--line:color-mix(in srgb,var(--text) 12%,var(--bg));--tint:color-mix(in srgb,var(--primary) 9%,var(--card));--gold:color-mix(in srgb,var(--accent) 16%,var(--card));
--red:#b3261e;--shadow:0 2px 14px color-mix(in srgb,var(--text) 6%,transparent)}
*{box-sizing:border-box}
body{margin:0;font-family:var(--body);font-size:15px;line-height:1.5;color:var(--text);-webkit-font-smoothing:antialiased;background-color:var(--bg);
  background-image:radial-gradient(circle at 15% 20%,color-mix(in srgb,var(--accent) 7%,transparent) 0,transparent 45%),radial-gradient(circle at 85% 80%,color-mix(in srgb,var(--primary) 6%,transparent) 0,transparent 45%);background-attachment:fixed;min-height:100vh}
a{color:var(--deep)}h1,h2,h3{font-family:var(--title);font-weight:500;line-height:1.15;margin:0 0 .7rem;color:var(--text)}
h3{font-size:1.45rem;display:flex;flex-wrap:wrap;align-items:center;gap:.6rem}
.amp{color:var(--primary);font-style:italic}
.kicker{display:block;font-size:.68rem;letter-spacing:.3em;text-transform:uppercase;color:var(--deep);margin:0 0 .25rem;font-weight:500}
/* En-tête */
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line);
  padding:.85rem max(1.25rem,calc((100% - 1200px)/2 + 1.25rem));display:flex;flex-wrap:wrap;gap:.75rem 1.5rem;align-items:center;justify-content:space-between}
.top .names{font-family:var(--title);font-size:1.75rem;font-weight:500;line-height:1.1}
.top small{display:block;color:var(--soft);font-size:.82rem;margin-top:.15rem}
.top .actions{display:flex;align-items:center;gap:.5rem}
.top form{margin:0;display:flex}
.wrap{max-width:1200px;margin:0 auto;padding:1.5rem 1.25rem 3rem}
/* Chiffres clés */
.kpis{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:1.5rem}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:1rem 1.1rem;box-shadow:var(--shadow);position:relative;overflow:hidden}
.kpi:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--accent);opacity:.8}
.kpi:first-child:before{background:var(--primary)}
.kpi b{display:block;font-family:var(--title);font-weight:500;font-size:2.4rem;line-height:1;color:var(--text);font-variant-numeric:lining-nums tabular-nums}
.kpi span{display:block;margin-top:.35rem;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}
/* Onglets */
.tabs{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1.25rem}
.tabs a{padding:.55rem 1.05rem;border-radius:999px;background:var(--card);border:1px solid var(--line);text-decoration:none;color:var(--soft);font-size:.9rem;white-space:nowrap;transition:.2s}
.tabs a:hover{border-color:var(--primary);color:var(--deep)}
.tabs a.on{background:var(--primary);color:#fff;border-color:var(--primary);font-weight:500}
/* Cartes */
.box{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:1.25rem;margin-bottom:1.25rem;box-shadow:var(--shadow)}
.box>p:first-child{font-family:var(--title);font-size:1.25rem;font-style:italic;line-height:1.45;margin-top:0}
.bar{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-bottom:1rem}
/* Champs et boutons */
input,select,textarea,button{font:inherit}
input,select,textarea{padding:.6rem .85rem;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--text);font-size:.92rem}
input:focus,select:focus,textarea:focus{outline:2px solid color-mix(in srgb,var(--primary) 55%,transparent);outline-offset:0;border-color:transparent}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;padding:.6rem 1.2rem;border-radius:999px;border:1px solid var(--primary);background:var(--primary);color:#fff;
  text-decoration:none;cursor:pointer;font-size:.88rem;font-weight:500;line-height:1.2;white-space:nowrap;transition:background .2s,border-color .2s,color .2s}
.btn:hover{background:var(--deep);border-color:var(--deep)}
.btn.light{background:var(--card);color:var(--text);border-color:var(--line)}.btn.light:hover{border-color:var(--primary);color:var(--deep);background:var(--card)}
.btn.red{background:transparent;color:var(--red);border-color:color-mix(in srgb,var(--red) 35%,transparent)}.btn.red:hover{background:var(--red);color:#fff;border-color:var(--red)}
.btn.sm{padding:.4rem .85rem;font-size:.8rem}
button[disabled]{opacity:.6;cursor:wait}
/* Tableaux */
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}table{width:100%;border-collapse:collapse;font-size:.88rem}
th,td{padding:.65rem .6rem;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
th{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;color:var(--soft);white-space:nowrap;background:color-mix(in srgb,var(--bg) 60%,var(--card))}
tr:hover td{background:color-mix(in srgb,var(--accent) 5%,transparent)}
td.c,th.c{text-align:center}.yes{color:var(--text);font-weight:600}.no{color:var(--red)}.muted{color:var(--muted)}
th a{color:inherit;text-decoration:none}th a:hover{color:var(--deep)}
td.actions{white-space:nowrap}td.actions>*{display:inline-block;margin:0 .25rem .25rem 0;vertical-align:middle}
td[data-label=Message]{min-width:15rem}
.pill{display:inline-block;padding:.15rem .6rem;border-radius:999px;font-size:.74rem;font-weight:500;background:var(--gold);color:var(--soft);white-space:nowrap}
h3 .pill{font-family:var(--body);font-size:.75rem}
.pill.ok{background:color-mix(in srgb,var(--text) 10%,var(--card));color:var(--text)}
.pill.wait{background:var(--tint);color:var(--deep)}
.pill.out{background:#f1eff9;color:#5b4b9a}.pill.warn{background:#fbe9e7;color:var(--red)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:var(--card)}
.seg a{padding:.45rem .95rem;font-size:.84rem;text-decoration:none;color:var(--soft)}.seg a.on{background:var(--text);color:var(--bg)}
.cols{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}.cols>.box{margin-bottom:0}
.list{list-style:none;margin:0;padding:0}.list li{display:flex;justify-content:space-between;gap:1rem;padding:.5rem 0;border-bottom:1px solid var(--line)}.list li:last-child{border-bottom:0}
.flash{background:color-mix(in srgb,var(--text) 7%,var(--card));border:1px solid color-mix(in srgb,var(--text) 18%,var(--card));border-radius:12px;padding:.75rem 1rem;margin-bottom:1.25rem}
.flash.err{background:#fbe9e7;border-color:#f0c4be;color:#8c1d17}
/* Connexion */
.login{max-width:380px;margin:12vh auto;background:var(--card);border-radius:18px;padding:2.25rem 2rem;border:1px solid var(--line);text-align:center;box-shadow:0 10px 40px color-mix(in srgb,var(--text) 8%,transparent)}
.login h1{font-size:2.3rem;margin:.2rem 0 .3rem}.login input{width:100%;margin:1.2rem 0 .8rem}.login .btn{width:100%}
.login a{font-size:.85rem;color:var(--soft)}
.copy{display:flex;align-items:center;gap:.5rem;margin:.35rem 0 1.1rem}
input[name=q]{min-width:18rem}.copy input{flex:1;min-width:0}
dialog{border:1px solid var(--line);border-radius:18px;padding:1.5rem;max-width:min(680px,94vw);width:100%;background:var(--card);color:var(--text);box-shadow:0 20px 60px rgba(0,0,0,.2)}
dialog::backdrop{background:color-mix(in srgb,var(--text) 45%,transparent)}
dialog label{font-size:.8rem;letter-spacing:.06em;color:var(--soft)}dialog label input{margin-top:.3rem;width:100%}
.qr{display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start}.qr>div:last-child{flex:1;min-width:240px}
.qr .code{width:220px;height:220px;background:#fff;padding:10px;border:1px solid var(--line);border-radius:14px}.qr .code svg{width:100%;height:100%}
/* Téléphone */
@media(max-width:700px){
  body{font-size:14.5px}
  .top{padding:.7rem 1rem;gap:.5rem}.top .names{font-size:1.4rem}.top small{font-size:.75rem}.top .kicker{font-size:.6rem}
  .top .actions{width:100%}.top .actions>*{flex:1}.top .actions .btn{width:100%}
  .wrap{padding:1rem .85rem 2.5rem}
  .kpis{grid-template-columns:repeat(2,1fr);gap:.5rem;margin-bottom:1rem}
  .kpi{padding:.75rem .85rem}.kpi b{font-size:1.9rem}.kpi span{font-size:.64rem;letter-spacing:.05em}
  .tabs{gap:.35rem}.tabs a{padding:.45rem .8rem;font-size:.84rem}
  .box{padding:1rem;border-radius:14px}
  .bar>input,.bar>select,.bar>form,.bar>form input[name=q]{flex:1 1 100%;min-width:0}
  /* Tableaux en fiches */
  table.cards,table.cards tbody{display:block}
  table.cards tr:has(th):not(:has(a)){display:none}
  table.cards tr:has(th){display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem}
  table.cards th{display:none;padding:0;border:0;background:none}
  table.cards th:has(a){display:block}table.cards th a{display:inline-block;padding:.35rem .7rem;border:1px solid var(--line);border-radius:999px;background:var(--card)}
  table.cards tr:not(:has(th)){display:block;border:1px solid var(--line);border-radius:12px;padding:.6rem .85rem;margin-bottom:.6rem;background:var(--card)}
  table.cards tr:hover td{background:none}
  table.cards td{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;border:0;padding:.28rem 0;text-align:right}
  table.cards td.c{text-align:right}
  table.cards td:first-child{display:block;text-align:left;font-size:1rem;padding-bottom:.4rem;margin-bottom:.2rem;border-bottom:1px solid var(--line)}
  table.cards td[data-label]:before{content:attr(data-label);color:var(--muted);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;text-align:left;flex:none;max-width:55%}
  table.cards td.actions{flex-wrap:wrap;gap:.4rem;white-space:normal;justify-content:flex-start;padding-top:.6rem;margin-top:.3rem;border-top:1px solid var(--line)}
  table.cards td[colspan]{display:block;text-align:center;border:0}
  table.cards td[data-label=Message]{min-width:0}
  table.cards td:empty{display:none}
  .qr .code{width:100%;max-width:260px;height:auto;aspect-ratio:1;margin:0 auto}
}
`
