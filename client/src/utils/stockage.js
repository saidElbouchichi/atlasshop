// Lecture / écriture sûres dans le localStorage : son contenu n'est jamais considéré comme fiable.

export function lireStockage(cle, valider, parDefaut, stockage = globalThis.localStorage) {
  try {
    const brut = stockage?.getItem(cle)
    if (!brut) return parDefaut
    const valeur = JSON.parse(brut)
    return valider(valeur) ? valeur : parDefaut
  } catch {
    // Donnée corrompue ou stockage bloqué : on repart de la valeur par défaut
    return parDefaut
  }
}

export function ecrireStockage(cle, valeur, stockage = globalThis.localStorage) {
  try {
    stockage?.setItem(cle, JSON.stringify(valeur))
    return true
  } catch {
    // Stockage plein ou navigation privée : l'état reste utilisable en mémoire
    return false
  }
}
