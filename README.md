# Sites de mariage — Cloudflare Workers + D1

Un modèle unique pour tous les sites de mariage. Chaque couple = un fichier `weddings/<slug>.json`
+ un Worker Cloudflare + une base D1. Aucun service tiers (plus de Base44).

## Fonctionnalités
**Site invités** : écran d'entrée « Entrer » (vidéo ou image), musique d'ambiance (une ou plusieurs pistes, bouton couper),
fond image/vidéo (version mobile possible), compte à rebours, notre histoire / citation, programme multi-jours avec icônes
(mention « provisoire »), lieux avec carte + liens Google Maps / Waze / Apple Plans, accès (voiture, train, avion, parking),
dress code avec pastilles de couleur, infos (enfants, date limite…), hôtels, FAQ, RSVP, aperçu WhatsApp/réseaux (Open Graph).

**RSVP** : mode simple (présent / nombre de personnes) ou par événement (cases + nombre par moment), email, accompagnants,
menu, restrictions, message ; liens d'invitation par groupe (`?k=...`) qui n'affichent que les moments prévus (ex. mairie
réservée à la famille, filtrage aussi côté serveur) ; récapitulatif et lien privé pour modifier sa réponse ; anti-robots.

**Espace mariés** (`/espace-maries`, mot de passe) : chiffres clés par événement, tableau filtrable (nom, groupe,
événement), suppression, export CSV compatible Excel, « qui vient à quoi », restrictions, livre d'or (messages),
liste d'invités attendus (import Excel avec aperçu, ajout/modification, rapprochement automatique avec les réponses,
gestion des homonymes, export de relance), liens à partager par groupe, QR code PNG 2048 px / SVG.

## Nouveau mariage
1. Copier un fichier de `weddings/`, l'adapter, l'ajouter dans `src/config.ts`.
2. Ajouter un bloc `env` dans `wrangler.jsonc`.
3. `npx wrangler d1 create mariage-<slug>` → coller l'id dans `wrangler.jsonc`.
4. `npx wrangler d1 migrations apply mariage-<slug> --remote --env <slug>`
5. `npx wrangler secret put ADMIN_PASSWORD --env <slug>`
6. `npx wrangler deploy --env <slug>` → `https://mariage-<slug>.<compte>.workers.dev`

## Domaine payant
Paul & Caroline : `pauletcaroline.com` (et `www.` redirigé par le Worker vers le domaine nu).

Acheter/transférer le domaine sur Cloudflare, puis dans l'env du mariage :
`"routes": [{ "pattern": "pauline-et-benjamin.fr", "custom_domain": true }]`, renseigner `siteUrl` dans le JSON
(pour le QR code) et redéployer. L'adresse workers.dev peut ensuite être coupée (`"workers_dev": false`).

## Développement local
`echo ADMIN_PASSWORD=test > .dev.vars && npx wrangler d1 migrations apply mariage-local --local && npx wrangler dev`
(`--var WEDDING_SLUG:paul-caroline-wedding` pour un autre mariage)
