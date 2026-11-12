// Validation des formulaires côté client. Le serveur revalidera tout en Phase 2 (express-validator).

const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MOTIF_TELEPHONE_MAROC = /^(?:\+212|0)[5-7]\d{8}$/
const MOTIF_CODE_POSTAL = /^\d{5}$/
export const LONGUEUR_MIN_MOT_DE_PASSE = 6

export const estEmailValide = (email) => MOTIF_EMAIL.test(String(email ?? '').trim())

const estVide = (valeur) => String(valeur ?? '').trim().length === 0

// Chaque fonction retourne un objet { champ: message } ; vide si tout est valide.

export function validerConnexion({ email, password }) {
  const erreurs = {}
  if (!estEmailValide(email)) erreurs.email = 'Saisissez une adresse e-mail valide.'
  if (String(password ?? '').length < LONGUEUR_MIN_MOT_DE_PASSE) {
    erreurs.password = `Le mot de passe compte au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`
  }
  return erreurs
}

export function validerInscription({ name, email, password, confirmation }) {
  const erreurs = validerConnexion({ email, password })
  if (String(name ?? '').trim().length < 2) erreurs.name = 'Indiquez votre nom.'
  if (password !== confirmation) erreurs.confirmation = 'Les deux mots de passe ne correspondent pas.'
  return erreurs
}

export function validerAdresse({ fullName, phone, address, city, postalCode }) {
  const erreurs = {}
  if (String(fullName ?? '').trim().length < 2) erreurs.fullName = 'Indiquez le nom du destinataire.'
  if (!MOTIF_TELEPHONE_MAROC.test(String(phone ?? '').replace(/[\s.-]/g, ''))) {
    erreurs.phone = 'Numéro marocain attendu, par exemple 0612345678.'
  }
  if (String(address ?? '').trim().length < 5) erreurs.address = 'Indiquez une adresse complète.'
  if (estVide(city)) erreurs.city = 'Indiquez la ville.'
  if (!MOTIF_CODE_POSTAL.test(String(postalCode ?? '').trim())) erreurs.postalCode = 'Code postal à 5 chiffres.'
  return erreurs
}

export function validerProduit({ name, price, stock, category, description }) {
  const erreurs = {}
  if (String(name ?? '').trim().length < 2) erreurs.name = 'Indiquez le nom du produit.'
  if (!(Number(price) > 0)) erreurs.price = 'Le prix doit être supérieur à 0.'
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) erreurs.stock = 'Le stock est un entier positif.'
  if (estVide(category)) erreurs.category = 'Choisissez une catégorie.'
  if (String(description ?? '').trim().length < 10) erreurs.description = 'Décrivez le produit (10 caractères minimum).'
  return erreurs
}

export function validerAvis({ rating, comment }) {
  const erreurs = {}
  const note = Number(rating)
  if (!Number.isInteger(note) || note < 1 || note > 5) erreurs.rating = 'Choisissez une note de 1 à 5.'
  if (String(comment ?? '').trim().length < 5) erreurs.comment = 'Votre avis est un peu court.'
  return erreurs
}

export const estValide = (erreurs) => Object.keys(erreurs).length === 0
