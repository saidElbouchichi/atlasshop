import { createSelector, createSlice } from '@reduxjs/toolkit'
import { creerAppel, requete } from '../../services/api'

// Produits : chargés depuis l'API (/api/products), CRUD réservé à l'admin, avis des clients.
const NOMBRE_MAX_PRODUITS = 100

export const chargerProduits = creerAppel('products/charger', async () =>
  (await requete({ url: '/products', params: { limit: NOMBRE_MAX_PRODUITS } })).data,
)

export const creerProduit = creerAppel('products/creer', async (donnees) =>
  (await requete({ url: '/products', method: 'post', data: donnees })).data,
)

export const majProduit = creerAppel('products/modifier', async ({ _id, ...donnees }) =>
  (await requete({ url: `/products/${_id}`, method: 'put', data: donnees })).data,
)

export const effacerProduit = creerAppel('products/supprimer', async (id) => {
  await requete({ url: `/products/${id}`, method: 'delete' })
  return id
})

// Un avis par client et par produit ; l'API renvoie le produit avec sa nouvelle note
export const envoyerAvis = creerAppel('products/avis', async ({ productId, rating, comment }) =>
  (await requete({ url: `/products/${productId}/reviews`, method: 'post', data: { rating, comment } })).data,
)

const remplacer = (state, action) => {
  state.items = state.items.map((produit) => (produit._id === action.payload._id ? action.payload : produit))
}

const productsSlice = createSlice({
  name: 'products',
  // status : 'idle' | 'loading' | 'succeeded' | 'failed'
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(chargerProduits.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(chargerProduits.fulfilled, (state, action) => {
        state.items = action.payload
        state.status = 'succeeded'
      })
      .addCase(chargerProduits.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message ?? 'Chargement impossible.'
      })
      .addCase(creerProduit.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(majProduit.fulfilled, remplacer)
      .addCase(envoyerAvis.fulfilled, remplacer)
      .addCase(effacerProduit.fulfilled, (state, action) => {
        state.items = state.items.filter((produit) => produit._id !== action.payload)
      })
  },
})

export const selectProduits = (state) => state.products.items
export const selectStatutProduits = (state) => state.products.status
export const selectErreurProduits = (state) => state.products.error
// Mémoïsé : retourne le même tableau tant que la liste des produits ne change pas
export const selectProduitsVedettes = createSelector([selectProduits], (produits) =>
  produits.filter((produit) => produit.isFeatured),
)
export const selectProduitParSlug = (slug) => (state) =>
  state.products.items.find((produit) => produit.slug === slug)

export default productsSlice.reducer
