import { createSlice } from '@reduxjs/toolkit'
import { creerAppel, requete } from '../../services/api'

// Commandes : API /api/orders et paiement /api/payments.

export const chargerMesCommandes = creerAppel('orders/mesCommandes', async () => (await requete({ url: '/orders/mine' })).data)
export const chargerCommandes = creerAppel('orders/toutes', async () => (await requete({ url: '/orders' })).data)
export const chargerCommande = creerAppel('orders/une', async (id) => (await requete({ url: `/orders/${id}` })).data)

// Crée la commande puis, par carte, ouvre le paiement. Retourne { commande, url, simule } :
// `url` est la page Stripe Checkout ; il est nul si la commande se règle à la livraison,
// et `simule` est vrai si le paiement est simulé (développement sans clé Stripe).
export const passerCommande = creerAppel('orders/passer', async ({ items, shippingAddress, paymentMethod }) => {
  const { data: commande } = await requete({ url: '/orders', method: 'post', data: { items, shippingAddress, paymentMethod } })
  if (paymentMethod === 'livraison') return { commande, url: null, simule: false }
  const { data: paiement } = await requete({ url: '/payments/create-checkout-session', method: 'post', data: { orderId: commande._id } })
  return { commande, ...paiement }
})

export const majStatut = creerAppel('orders/statut', async ({ id, status }) =>
  (await requete({ url: `/orders/${id}/status`, method: 'put', data: { status } })).data,
)

// Ajoute la commande ou remplace sa version précédente
const enregistrer = (state, commande) => {
  const position = state.items.findIndex((element) => element._id === commande._id)
  if (position === -1) state.items.unshift(commande)
  else state.items[position] = commande
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [] },
  reducers: {},
  extraReducers: (builder) => {
    const remplacerTout = (state, action) => {
      state.items = action.payload
    }
    builder
      .addCase(chargerMesCommandes.fulfilled, remplacerTout)
      .addCase(chargerCommandes.fulfilled, remplacerTout)
      .addCase(chargerCommande.fulfilled, (state, action) => enregistrer(state, action.payload))
      .addCase(majStatut.fulfilled, (state, action) => enregistrer(state, action.payload))
      .addCase(passerCommande.fulfilled, (state, action) => enregistrer(state, action.payload.commande))
  },
})

// Selon la route, `user` est un identifiant ou un objet { _id, name, email }
export const idClient = (commande) => commande.user?._id ?? commande.user

export const selectCommandes = (state) => state.orders.items
export const selectCommandeParId = (id) => (state) =>
  state.orders.items.find((commande) => commande._id === id)

export default ordersSlice.reducer
