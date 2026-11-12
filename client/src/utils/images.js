// Aide pour les photos : format WebP, largeur adaptée et srcset.
// Une image est soit une photo Unsplash { id, alt }, soit une image importée { url, alt }
// (aperçu local de l'admin en Phase 1, Cloudinary en Phase 2).
const BASE_UNSPLASH = 'https://images.unsplash.com/photo-'
const LARGEURS_PAR_DEFAUT = [480, 800, 1200, 1600]
const QUALITE = 70

export function urlPhoto(id, largeur = 800) {
  return `${BASE_UNSPLASH}${id}?auto=format&fit=crop&fm=webp&q=${QUALITE}&w=${largeur}`
}

export function srcSetPhoto(id, largeurs = LARGEURS_PAR_DEFAUT) {
  return largeurs.map((largeur) => `${urlPhoto(id, largeur)} ${largeur}w`).join(', ')
}

// Attributs src / srcSet d'une image, quelle que soit sa provenance
export function sourcesPhoto(image, largeur = 800) {
  if (image?.url) return { src: image.url }
  return { src: urlPhoto(image.id, largeur), srcSet: srcSetPhoto(image.id) }
}

export const cleImage = (image) => image.cle ?? image.id ?? image.url
