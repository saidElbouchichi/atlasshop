import { createSlice } from '@reduxjs/toolkit'
import { products } from '../../data/products'

// Phase 1 : données mockées chargées directement.
// Phase 2 : ce slice passera par des thunks axios (GET /api/products).
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: products,
    status: 'succeeded',
    error: null,
  },
  reducers: {},
})

export const selectProduits = (state) => state.products.items
export const selectProduitsVedettes = (state) =>
  state.products.items.filter((produit) => produit.isFeatured)
export const selectProduitParSlug = (slug) => (state) =>
  state.products.items.find((produit) => produit.slug === slug)

export default productsSlice.reducer
