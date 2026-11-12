import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { ecrireStockage } from '../utils/stockage'
import authReducer, { CLE_STOCKAGE_UTILISATEUR } from './slices/authSlice'
import cartReducer, { CLE_STOCKAGE_PANIER } from './slices/cartSlice'
import categoriesReducer from './slices/categoriesSlice'
import ordersReducer, { CLE_STOCKAGE_COMMANDES } from './slices/ordersSlice'
import productsReducer from './slices/productsSlice'
import uiReducer from './slices/uiSlice'

export const reducerRacine = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  categories: categoriesReducer,
  orders: ordersReducer,
  products: productsReducer,
  ui: uiReducer,
})

export const creerStore = (preloadedState) => configureStore({ reducer: reducerRacine, preloadedState })

export const store = creerStore()

// Morceaux d'état conservés dans le navigateur entre deux visites
const PERSISTANCES = [
  { cle: CLE_STOCKAGE_PANIER, lire: (etat) => etat.cart.items },
  { cle: CLE_STOCKAGE_UTILISATEUR, lire: (etat) => etat.auth.user },
  { cle: CLE_STOCKAGE_COMMANDES, lire: (etat) => etat.orders.items },
]

const dernieresValeurs = new Map(PERSISTANCES.map(({ cle, lire }) => [cle, lire(store.getState())]))

store.subscribe(() => {
  const etat = store.getState()
  PERSISTANCES.forEach(({ cle, lire }) => {
    const valeur = lire(etat)
    if (valeur === dernieresValeurs.get(cle)) return
    dernieresValeurs.set(cle, valeur)
    ecrireStockage(cle, valeur)
  })
})
