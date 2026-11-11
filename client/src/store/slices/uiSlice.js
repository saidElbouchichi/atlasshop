import { createSlice } from '@reduxjs/toolkit'

// État d'interface : menu plein écran et tiroir panier
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    menuOuvert: false,
    panierOuvert: false,
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
  },
})

export const { ouvrirMenu, fermerMenu, ouvrirPanier, fermerPanier } = uiSlice.actions

export const selectMenuOuvert = (state) => state.ui.menuOuvert
export const selectPanierOuvert = (state) => state.ui.panierOuvert

export default uiSlice.reducer
