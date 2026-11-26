// Worker relais déployé dans le compte Cloudflare qui détient pauletcaroline.com
// (domaine acheté sur un autre compte que celui du site). Il renvoie chaque requête
// vers le site hébergé sur workers.dev, en conservant chemin, paramètres, méthode et cookies.
// À supprimer une fois le domaine déplacé dans le compte du site (voir wrangler.jsonc).
const ORIGINE = 'https://paul-caroline-wedding.62z7h87vzm.workers.dev'

export default {
  async fetch(request) {
    const url = new URL(request.url)
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4)
      return Response.redirect(url.toString(), 301)
    }
    const cible = new URL(url.pathname + url.search, ORIGINE)
    const reponse = await fetch(new Request(cible, request), { redirect: 'manual' })
    // Redirections absolues vers workers.dev : on les remet sur le domaine
    const location = reponse.headers.get('location')
    if (location && location.startsWith(ORIGINE)) {
      const r = new Response(reponse.body, reponse)
      r.headers.set('location', location.replace(ORIGINE, url.origin))
      return r
    }
    return reponse
  },
}
