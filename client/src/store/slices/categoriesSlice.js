import { createSlice } from '@reduxjs/toolkit'
import { categories } from '../../data/categories'

// Catégories : CRUD local en Phase 1, API (/api/categories) en Phase 2
const categoriesSlice = createSlice({
  name: 'categories',
  initialState: { items: categories },
  reducers: {
    ajouterCategorie(state, action) {
      state.items.push(action.payload)
    },
    modifierCategorie(state, action) {
      const { _id, ...changements } = action.payload
      const categorie = state.items.find((element) => element._id === _id)
      if (categorie) Object.assign(categorie, changements)
    },
    supprimerCategorie(state, action) {
      state.items = state.items.filter((categorie) => categorie._id !== action.payload)
    },
  },
})

export const { ajouterCategorie, modifierCategorie, supprimerCategorie } = categoriesSlice.actions

export const selectCategories = (state) => state.categories.items
export const selectNomCategorie = (slug) => (state) =>
  state.categories.items.find((categorie) => categorie.slug === slug)?.name ?? slug

export default categoriesSlice.reducer
