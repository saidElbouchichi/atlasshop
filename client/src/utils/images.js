// Aide pour les photos Unsplash : format WebP, largeur adaptée et srcset.
// En Phase 2, les images produits viendront de Cloudinary (même principe).
const BASE_UNSPLASH = 'https://images.unsplash.com/photo-'
const LARGEURS_PAR_DEFAUT = [480, 800, 1200, 1600]
const QUALITE = 70

export function urlPhoto(id, largeur = 800) {
  return `${BASE_UNSPLASH}${id}?auto=format&fit=crop&fm=webp&q=${QUALITE}&w=${largeur}`
}

export function srcSetPhoto(id, largeurs = LARGEURS_PAR_DEFAUT) {
  return largeurs.map((largeur) => `${urlPhoto(id, largeur)} ${largeur}w`).join(', ')
}
