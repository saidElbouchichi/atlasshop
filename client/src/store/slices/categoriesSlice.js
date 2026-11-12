import { createSlice } from '@reduxjs/toolkit'
import { creerAppel, requete } from '../../services/api'

// Catégories : chargées depuis l'API (/api/categories), CRUD réservé à l'admin
export const chargerCategories = creerAppel('categories/charger', async () => (await requete({ url: '/categories' })).data)

export const creerCategorie = creerAppel('categories/creer', async (donnees) =>
  (await requete({ url: '/categories', method: 'post', data: donnees })).data,
)

export const majCategorie = creerAppel('categories/modifier', async ({ _id, ...donnees }) =>
  (await requete({ url: `/categories/${_id}`, method: 'put', data: donnees })).data,
)

export const effacerCategorie = creerAppel('categories/supprimer', async (id) => {
  await requete({ url: `/categories/${id}`, method: 'delete' })
  return id
})

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: [] },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(chargerCategories.fulfilled, (state, action) => {
        state.items = action.payload
      })
      .addCase(creerCategorie.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(majCategorie.fulfilled, (state, action) => {
        state.items = state.items.map((categorie) => (categorie._id === action.payload._id ? action.payload : categorie))
      })
      .addCase(effacerCategorie.fulfilled, (state, action) => {
        state.items = state.items.filter((categorie) => categorie._id !== action.payload)
      })
  },
})

export const selectCategories = (state) => state.categories.items
export const selectNomCategorie = (slug) => (state) =>
  state.categories.items.find((categorie) => categorie.slug === slug)?.name ?? slug

export default categoriesSlice.reducer
