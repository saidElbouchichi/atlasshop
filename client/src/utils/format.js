// Formate un prix en dirhams : 3400 -> « 3 400 MAD »
export function formaterPrix(montant) {
  const valeur = Number.isFinite(montant) ? montant : 0
  // Espace insécable entre les milliers pour éviter les retours à la ligne
  const entier = Math.round(valeur)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${entier} MAD`
}

// Formate un index de carrousel sur deux chiffres : 1 -> « 01 »
export function deuxChiffres(nombre) {
  return String(nombre).padStart(2, '0')
}
