// Logique du catalogue : recherche, filtres, tri et pagination.
// Les mêmes paramètres (?q, ?category, ?minPrice, ?maxPrice, ?sort, ?page) seront envoyés à l'API en Phase 2.

export const PRODUITS_PAR_PAGE = 6

export const TRIS = [
  { valeur: 'vedettes', texte: 'Sélection' },
  { valeur: 'prix-asc', texte: 'Prix croissant' },
  { valeur: 'prix-desc', texte: 'Prix décroissant' },
  { valeur: 'note', texte: 'Mieux notés' },
  { valeur: 'nom', texte: 'Nom A → Z' },
]

const COMPARATEURS = {
  vedettes: (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
  'prix-asc': (a, b) => a.price - b.price,
  'prix-desc': (a, b) => b.price - a.price,
  note: (a, b) => b.rating - a.rating,
  nom: (a, b) => a.name.localeCompare(b.name, 'fr'),
}

// Minuscules sans accents, pour une recherche tolérante (« ceramique » trouve « céramique »)
export function normaliser(texte) {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

function nombreOuNul(valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return null
  const nombre = Number(valeur)
  return Number.isFinite(nombre) && nombre >= 0 ? nombre : null
}

// Lit et assainit les critères depuis les paramètres d'URL (données non fiables)
export function lireCriteres(parametres) {
  const tri = parametres.get('sort')
  const page = Number.parseInt(parametres.get('page') ?? '1', 10)
  return {
    q: (parametres.get('q') ?? '').slice(0, 80),
    category: parametres.get('category') ?? '',
    minPrice: nombreOuNul(parametres.get('minPrice')),
    maxPrice: nombreOuNul(parametres.get('maxPrice')),
    sort: tri in COMPARATEURS ? tri : 'vedettes',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function filtrerProduits(produits, criteres) {
  const recherche = normaliser(criteres.q)
  return produits.filter((produit) => {
    if (criteres.category && produit.category !== criteres.category) return false
    if (criteres.minPrice !== null && produit.price < criteres.minPrice) return false
    if (criteres.maxPrice !== null && produit.price > criteres.maxPrice) return false
    if (!recherche) return true
    const contenu = normaliser(`${produit.name} ${produit.description} ${produit.artisan}`)
    return contenu.includes(recherche)
  })
}

export function trierProduits(produits, tri) {
  const comparer = COMPARATEURS[tri] ?? COMPARATEURS.vedettes
  // Copie avant tri : on ne modifie jamais le tableau d'origine
  return [...produits].sort(comparer)
}

export function paginer(elements, page, parPage = PRODUITS_PAR_PAGE) {
  const totalPages = Math.max(1, Math.ceil(elements.length / parPage))
  const pageCourante = Math.min(Math.max(1, page), totalPages)
  const debut = (pageCourante - 1) * parPage
  return {
    elements: elements.slice(debut, debut + parPage),
    page: pageCourante,
    totalPages,
    total: elements.length,
  }
}

export function chercherProduits(produits, criteres) {
  const tries = trierProduits(filtrerProduits(produits, criteres), criteres.sort)
  return paginer(tries, criteres.page)
}

// « Tapis Azilal Soleil » -> « tapis-azilal-soleil »
export function creerSlug(texte) {
  return normaliser(texte)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
