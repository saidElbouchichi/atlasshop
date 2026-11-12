import { createSlice } from '@reduxjs/toolkit'
import { creerAppel, ecrireJeton, lireJeton, requete } from '../../services/api'

// Authentification JWT : register, login, logout, me — et gestion des utilisateurs par l'admin.

const ouvrirSession = (url) => async (identifiants) => {
  const { data } = await requete({ url, method: 'post', data: identifiants })
  ecrireJeton(data.token)
  return data.user
}

export const connexion = creerAppel('auth/connexion', ouvrirSession('/auth/login'))
export const inscription = creerAppel('auth/inscription', ouvrirSession('/auth/register'))

// Au démarrage : si un jeton est mémorisé, on recharge le compte correspondant
export const chargerSession = creerAppel('auth/chargerSession', async () => {
  if (!lireJeton()) return null
  const { data } = await requete({ url: '/auth/me' })
  return data.user
})

export const deconnexion = creerAppel('auth/deconnexion', async () => {
  ecrireJeton('')
  // Le JWT est sans état : l'appel au serveur est une simple politesse, son échec n'empêche rien
  await requete({ url: '/auth/logout', method: 'post' }).catch(() => null)
  return null
})

export const chargerUtilisateurs = creerAppel('auth/chargerUtilisateurs', async () => (await requete({ url: '/users' })).data)

export const modifierRole = creerAppel('auth/modifierRole', async ({ id, role }) =>
  (await requete({ url: `/users/${id}/role`, method: 'put', data: { role } })).data,
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    // « verification » tant qu'on ne sait pas si le jeton mémorisé est encore valable
    statut: lireJeton() ? 'verification' : 'pret',
    users: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    const connecter = (state, action) => {
      state.user = action.payload
      state.statut = 'pret'
    }
    builder
      .addCase(connexion.fulfilled, connecter)
      .addCase(inscription.fulfilled, connecter)
      .addCase(chargerSession.fulfilled, connecter)
      .addCase(chargerSession.rejected, (state, action) => {
        // Jeton expiré ou compte supprimé : on repart déconnecté (une simple panne réseau garde le jeton)
        if (action.payload?.status === 401) ecrireJeton('')
        state.user = null
        state.statut = 'pret'
      })
      .addCase(deconnexion.fulfilled, (state) => {
        state.user = null
        state.users = []
      })
      .addCase(chargerUtilisateurs.fulfilled, (state, action) => {
        state.users = action.payload
      })
      .addCase(modifierRole.fulfilled, (state, action) => {
        state.users = state.users.map((utilisateur) => (utilisateur._id === action.payload._id ? action.payload : utilisateur))
      })
  },
})

export const selectUtilisateur = (state) => state.auth.user
export const selectStatutSession = (state) => state.auth.statut
export const selectUtilisateurs = (state) => state.auth.users
export const selectEstAdmin = (state) => state.auth.user?.role === 'admin'

export default authSlice.reducer
