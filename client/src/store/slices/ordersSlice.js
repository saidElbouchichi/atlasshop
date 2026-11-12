import { createSlice } from '@reduxjs/toolkit'
import { commandesDemo } from '../../data/mock'
import { STATUTS_COMMANDE } from '../../utils/commande'
import { lireStockage } from '../../utils/stockage'

export const CLE_STOCKAGE_COMMANDES = 'atlasshop_commandes'

const estCommandeValide = (commande) =>
  commande &&
  typeof commande._id === 'string' &&
  Array.isArray(commande.items) &&
  Number.isFinite(commande.totalPrice) &&
  STATUTS_COMMANDE.includes(commande.status)

const sontCommandesValides = (commandes) => Array.isArray(commandes) && commandes.every(estCommandeValide)

// Phase 1 : commandes de démo + commandes passées dans ce navigateur.
// Phase 2 : API /api/orders.
const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: lireStockage(CLE_STOCKAGE_COMMANDES, sontCommandesValides, commandesDemo) },
  reducers: {
    ajouterCommande(state, action) {
      state.items.unshift(action.payload)
    },
    changerStatut(state, action) {
      const { id, status } = action.payload
      const commande = state.items.find((element) => element._id === id)
      if (!commande || !STATUTS_COMMANDE.includes(status)) return
      commande.status = status
      if (status !== 'en attente' && status !== 'annulée' && !commande.isPaid) {
        commande.isPaid = true
        commande.paidAt = new Date().toISOString()
      }
    },
  },
})

export const { ajouterCommande, changerStatut } = ordersSlice.actions

export const selectCommandes = (state) => state.orders.items
export const selectCommandeParId = (id) => (state) =>
  state.orders.items.find((commande) => commande._id === id)

export default ordersSlice.reducer
