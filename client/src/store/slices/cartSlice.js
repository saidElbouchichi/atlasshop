import { createSlice } from '@reduxjs/toolkit'

export const CLE_STOCKAGE_PANIER = 'atlasshop_panier_v2'
const QUANTITE_MIN = 1

// Un article n'est accepté que s'il a la forme attendue (le localStorage n'est pas fiable)
function estArticleValide(article) {
  return (
    article &&
    typeof article.product === 'string' &&
    typeof article.name === 'string' &&
    typeof article.slug === 'string' &&
    Boolean(article.image?.id || article.image?.url) &&
    Number.isFinite(article.price) &&
    Number.isInteger(article.qty) &&
    article.qty >= QUANTITE_MIN
  )
}

export function chargerPanier(stockage = globalThis.localStorage) {
  try {
    const brut = stockage?.getItem(CLE_STOCKAGE_PANIER)
    const articles = brut ? JSON.parse(brut) : []
    return Array.isArray(articles) ? articles.filter(estArticleValide) : []
  } catch {
    // Donnée corrompue : on repart d'un panier vide plutôt que de planter l'app
    return []
  }
}

function borner(quantite, stock) {
  const max = Number.isInteger(stock) ? Math.max(QUANTITE_MIN, stock) : Infinity
  return Math.max(QUANTITE_MIN, Math.min(quantite, max))
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: chargerPanier() },
  // Redux Toolkit (Immer) produit un nouvel état immuable à partir de ces « mutations »
  reducers: {
    ajouterAuPanier(state, action) {
      const { produit, qty = 1 } = action.payload
      // Rupture de stock : rien à ajouter
      if (Number.isInteger(produit.stock) && produit.stock <= 0) return
      const existant = state.items.find((article) => article.product === produit._id)
      if (existant) {
        existant.qty = borner(existant.qty + qty, existant.stock)
        return
      }
      state.items.push({
        product: produit._id,
        name: produit.name,
        slug: produit.slug,
        image: produit.images[0],
        price: produit.price,
        stock: produit.stock,
        qty: borner(qty, produit.stock),
      })
    },
    modifierQuantite(state, action) {
      const { id, qty } = action.payload
      const article = state.items.find((element) => element.product === id)
      if (article) article.qty = borner(qty, article.stock)
    },
    retirerDuPanier(state, action) {
      state.items = state.items.filter((article) => article.product !== action.payload)
    },
    viderPanier(state) {
      state.items = []
    },
  },
})

export const { ajouterAuPanier, modifierQuantite, retirerDuPanier, viderPanier } = cartSlice.actions

export const selectArticles = (state) => state.cart.items
export const selectNombreArticles = (state) =>
  state.cart.items.reduce((total, article) => total + article.qty, 0)
export const selectSousTotal = (state) =>
  state.cart.items.reduce((total, article) => total + article.price * article.qty, 0)

export default cartSlice.reducer
