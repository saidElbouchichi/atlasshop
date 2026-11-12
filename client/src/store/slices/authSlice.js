import { createSlice } from '@reduxjs/toolkit'
import { utilisateursDemo } from '../../data/mock'
import { lireStockage } from '../../utils/stockage'

export const CLE_STOCKAGE_UTILISATEUR = 'atlasshop_utilisateur'

const ROLES = ['user', 'admin']

const estUtilisateurValide = (utilisateur) =>
  utilisateur &&
  typeof utilisateur._id === 'string' &&
  typeof utilisateur.email === 'string' &&
  ROLES.includes(utilisateur.role)

// Phase 1 : authentification simulée (aucun mot de passe n'est stocké ni vérifié côté client).
// Phase 2 : register / login / logout / me avec JWT.
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: lireStockage(CLE_STOCKAGE_UTILISATEUR, estUtilisateurValide, null),
    users: utilisateursDemo,
  },
  reducers: {
    connecter(state, action) {
      state.user = action.payload
    },
    inscrire(state, action) {
      state.users.push(action.payload)
      state.user = action.payload
    },
    deconnecter(state) {
      state.user = null
    },
    changerRole(state, action) {
      const { id, role } = action.payload
      const utilisateur = state.users.find((element) => element._id === id)
      if (utilisateur && ROLES.includes(role)) utilisateur.role = role
    },
  },
})

export const { connecter, inscrire, deconnecter, changerRole } = authSlice.actions

export const selectUtilisateur = (state) => state.auth.user
export const selectUtilisateurs = (state) => state.auth.users
export const selectEstAdmin = (state) => state.auth.user?.role === 'admin'

export const trouverParEmail = (utilisateurs, email) =>
  utilisateurs.find((utilisateur) => utilisateur.email === String(email ?? '').trim().toLowerCase())

export default authSlice.reducer
