import { createSlice } from '@reduxjs/toolkit'

// Phase 1 : simple squelette. Le branchement JWT (register, login, me) arrive en Phase 2.
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    connecter(state, action) {
      state.user = action.payload
    },
    deconnecter(state) {
      state.user = null
    },
  },
})

export const { connecter, deconnecter } = authSlice.actions

export const selectUtilisateur = (state) => state.auth.user
export const selectEstAdmin = (state) => state.auth.user?.role === 'admin'

export default authSlice.reducer
