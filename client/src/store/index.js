import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer, { CLE_STOCKAGE_PANIER } from './slices/cartSlice'
import productsReducer from './slices/productsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    ui: uiReducer,
  },
})

// Le panier est conservé dans le navigateur entre deux visites
let dernierPanier = store.getState().cart.items
store.subscribe(() => {
  const panier = store.getState().cart.items
  if (panier === dernierPanier) return
  dernierPanier = panier
  try {
    localStorage.setItem(CLE_STOCKAGE_PANIER, JSON.stringify(panier))
  } catch (erreur) {
    // Stockage plein ou navigation privée : le panier reste utilisable en mémoire
    console.warn('Panier non sauvegardé :', erreur)
  }
})
