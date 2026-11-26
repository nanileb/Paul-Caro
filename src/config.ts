// Description complète d'un mariage : tout le site est généré à partir de ce fichier.
// Un fichier JSON par couple dans weddings/<slug>.json

export type Icon = 'rings' | 'heart' | 'flower' | 'glass' | 'food' | 'music' | 'sun' | 'moon' | 'sparkles' | 'mairie' | 'cake' | 'utensils' | 'waves' | 'pizza'

export type WeddingEvent = {
  key: string // identifiant stable, utilisé dans les réponses RSVP
  title: string
  day: string // ex. "Samedi 11 septembre 2027"
  time: string // ex. "16h00"
  note?: string
  icon?: Icon
  venue?: string // clé d'un lieu de `venues`
  noRsvp?: boolean // affiché au programme mais pas proposé dans le RSVP
}

export type Venue = {
  key: string
  label?: string // ex. "La cérémonie civile"
  name: string
  address: string
  description?: string
  image?: string
  onlyForEvents?: string[] // n'afficher le lieu que si l'invité voit un de ces événements
}

export type Profile = {
  label: string // affiché dans l'espace mariés
  events: string[] // événements visibles (et donc proposés au RSVP) avec ce lien
}

export type WeddingConfig = {
  slug: string
  partner1: string
  partner2: string
  monogram?: string // ex. "P & B"
  dateISO: string // date/heure du moment principal, avec fuseau
  dateLabel: string
  place: string // ex. "Saint-Fiacre-sur-Maine"
  siteUrl?: string // URL publique (QR code)
  seo: { title: string; description: string; image?: string }
  theme: {
    background: string
    surface: string
    text: string
    primary: string
    accent: string
    heroText: string
    fontTitle: string
    fontScript?: string
    fontAmp?: string // police dédiée à l'esperluette « & » (logos, titres), ex. "Parisienne"
    fontBody: string
    countdownColors?: string[]
    overlay?: string // voile sur l'image/vidéo de fond
  }
  media: {
    heroImage?: string
    heroImageMobile?: string
    heroVideo?: string
    splashVideo?: string
    music?: string[] // une ou plusieurs pistes enchaînées
  }
  splash: { enabled: boolean; kicker?: string; text?: string; image?: string; imagePosition?: string } // image : photo de fond sous un voile beige (layout classic)
  hero: { kicker?: string; text?: string; cta?: string; photo?: string; photoPosition?: string } // photo : portrait encadré (ou grande photo d'accueil en layout classic)
  story?: { title: string; paragraphs: string[]; signature?: string }
  quote?: string
  events: WeddingEvent[]
  programme?: { title?: string; intro?: string; provisional?: boolean }
  venues: Venue[]
  access?: { title: string; text: string; icon?: 'car' | 'parking' | 'train' | 'plane' }[]
  infos?: {
    dressCode?: { text: string; swatches?: { name: string; hex: string }[] }
    blocks?: { title: string; text: string }[]
  }
  hotels?: { name: string; place?: string; text?: string; url?: string; lines?: { icon: string; text: string }[] }[] // lines : infos en lignes à icônes (layout classic)
  hotelsNote?: string
  faq?: { q: string; a: string }[]
  rsvp: {
    deadlineLabel?: string
    perEvent: boolean // true : cases à cocher par événement avec nombre de personnes
    askEmail?: boolean
    askCompanions?: boolean
    askDietary?: boolean
    menuChoices?: string[]
    askChildren?: boolean // mode par événement : nombre d'adultes puis d'enfants
    maxPersons: number
    thanks?: string
  }
  profiles?: Record<string, Profile> // jeton opaque du lien (?k=...) -> profil
  defaultProfile?: string
  guestList?: boolean // liste d'invités attendus + relances dans l'espace mariés
  footerNote?: string
  layout?: 'classic' // site multi-pages (Accueil, Le lieu, Programme, Infos pratiques, RSVP), design d'origine Base44
  classic?: {
    weddingDay?: string // ex. "15 mai 2027" (écran d'entrée, en-tête de l'accueil)
    venueLine?: string // ex. "Mas Aubrilha · Clermont-l'Hérault" (écran d'entrée)
    footerPlace?: string // ex. "Mas Aubrilha — Clermont-l'Hérault"
    venueImage?: string // photo en tête de la page Le lieu
    banner?: { image: string; text: string } // bandeau photo + citation en bas de l'accueil
    scheduleNote?: string // note en bas du programme
  }
}

import paulCaroline from '../weddings/paul-caroline-wedding.json'
import emmaGab from '../weddings/emma-gab.json'
import ethanJulia from '../weddings/ethan-julia.json'
import mariePaul from '../weddings/marie-paul.json'
import paulineBenjamin from '../weddings/pauline-benjamin.json'

export const weddings: Record<string, WeddingConfig> = Object.fromEntries(
  [paulineBenjamin, paulCaroline, ethanJulia, mariePaul, emmaGab].map((w) => [w.slug, w as WeddingConfig]),
)

export function getWedding(slug: string): WeddingConfig {
  const w = weddings[slug]
  if (!w) throw new Error(`Mariage inconnu : ${slug}`)
  return w
}

export function profileFor(w: WeddingConfig, token: string | undefined | null): { key: string; profile: Profile } {
  const all = w.events.map((e) => e.key)
  if (!w.profiles) return { key: 'tous', profile: { label: 'Tous', events: all } }
  const key = token && w.profiles[token] ? token : w.defaultProfile ?? Object.keys(w.profiles)[0]
  return { key, profile: w.profiles[key] }
}

// Libellé d'un moment avec son jour quand le mariage dure plusieurs jours (« Soirée (samedi) »)
export function eventLabel(w: WeddingConfig, e: WeddingEvent) {
  const multi = new Set(w.events.map((x) => x.day)).size > 1
  return multi ? `${e.title} (${e.day.split(' ')[0].toLowerCase()})` : e.title
}

export const groupLabel = (w: WeddingConfig, key: string | null) => (key && w.profiles?.[key]?.label) || key || '—'
