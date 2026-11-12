import { createSlice, nanoid } from '@reduxjs/toolkit'

// État d'interface : menu plein écran, tiroir panier et toasts
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    menuOuvert: false,
    panierOuvert: false,
    toasts: [],
  },
  reducers: {
    ouvrirMenu(state) {
      state.menuOuvert = true
      state.panierOuvert = false
    },
    fermerMenu(state) {
      state.menuOuvert = false
    },
    ouvrirPanier(state) {
      state.panierOuvert = true
      state.menuOuvert = false
    },
    fermerPanier(state) {
      state.panierOuvert = false
    },
    afficherToast: {
      reducer(state, action) {
        state.toasts.push(action.payload)
      },
      // type : 'succes' | 'erreur' | 'info'
      prepare(message, type = 'succes') {
        return { payload: { id: nanoid(), message, type } }
      },
    },
    retirerToast(state, action) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { ouvrirMenu, fermerMenu, ouvrirPanier, fermerPanier, afficherToast, retirerToast } =
  uiSlice.actions

export const selectMenuOuvert = (state) => state.ui.menuOuvert
export const selectPanierOuvert = (state) => state.ui.panierOuvert
export const selectToasts = (state) => state.ui.toasts

export default uiSlice.reducer
