// Aide pour les photos : format WebP, largeur adaptée et srcset.
// Une image vient de l'API sous la forme { url, alt } (Unsplash pour le seed, Cloudinary pour l'admin) ;
// les images décoratives du site utilisent la forme courte { id, alt }.
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
const MARQUEUR_CLOUDINARY = '/image/upload/'

// Cloudinary sait redimensionner à la volée : on demande le bon format et la bonne largeur
const urlCloudinary = (url, largeur) => url.replace(MARQUEUR_CLOUDINARY, `${MARQUEUR_CLOUDINARY}f_auto,q_auto,w_${largeur}/`)

export function sourcesPhoto(image, largeur = 800) {
  if (!image) return { src: '' }
  const { url } = image
  if (!url) return { src: urlPhoto(image.id, largeur), srcSet: srcSetPhoto(image.id) }
  if (url.startsWith(BASE_UNSPLASH)) {
    const id = url.slice(BASE_UNSPLASH.length).split('?')[0]
    return { src: urlPhoto(id, largeur), srcSet: srcSetPhoto(id) }
  }
  if (url.includes(MARQUEUR_CLOUDINARY)) {
    return {
      src: urlCloudinary(url, largeur),
      srcSet: LARGEURS_PAR_DEFAUT.map((taille) => `${urlCloudinary(url, taille)} ${taille}w`).join(', '),
    }
  }
  return { src: url }
}

export const cleImage = (image) => image.cle ?? image.id ?? image.url
