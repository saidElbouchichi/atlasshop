import { createSlice } from '@reduxjs/toolkit'
import { avisParProduit } from '../../data/mock'
import { products } from '../../data/products'

// Phase 1 : données mockées et CRUD local.
// Phase 2 : ces reducers seront remplacés par des thunks axios (/api/products).
const produitsInitiaux = products.map((produit) => ({
  ...produit,
  reviews: avisParProduit[produit._id] ?? [],
}))

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: produitsInitiaux,
    status: 'succeeded',
    error: null,
  },
  // Redux Toolkit (Immer) produit un nouvel état immuable à partir de ces « mutations »
  reducers: {
    ajouterProduit(state, action) {
      state.items.unshift({ rating: 0, numReviews: 0, reviews: [], isFeatured: false, ...action.payload })
    },
    modifierProduit(state, action) {
      const { _id, ...changements } = action.payload
      const produit = state.items.find((element) => element._id === _id)
      if (produit) Object.assign(produit, changements)
    },
    supprimerProduit(state, action) {
      state.items = state.items.filter((produit) => produit._id !== action.payload)
    },
    ajouterAvis(state, action) {
      const { productId, avis } = action.payload
      const produit = state.items.find((element) => element._id === productId)
      // Un seul avis par utilisateur et par produit
      if (!produit || produit.reviews.some((existant) => existant.user === avis.user)) return
      const total = produit.rating * produit.numReviews + avis.rating
      produit.numReviews += 1
      produit.rating = Math.round((total / produit.numReviews) * 10) / 10
      produit.reviews.unshift(avis)
    },
  },
})

export const { ajouterProduit, modifierProduit, supprimerProduit, ajouterAvis } = productsSlice.actions

export const selectProduits = (state) => state.products.items
export const selectProduitsVedettes = (state) =>
  state.products.items.filter((produit) => produit.isFeatured)
export const selectProduitParSlug = (slug) => (state) =>
  state.products.items.find((produit) => produit.slug === slug)

export default productsSlice.reducer
