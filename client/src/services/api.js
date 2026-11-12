import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Client HTTP de l'API AtlasShop. Le JWT est gardé dans le navigateur et envoyé dans l'en-tête Authorization.
export const CLE_JETON = 'atlasshop_jeton'
const DELAI_MAX_MS = 15000

export function lireJeton() {
  try {
    return localStorage.getItem(CLE_JETON) ?? ''
  } catch {
    return ''
  }
}

export function ecrireJeton(jeton) {
  try {
    if (jeton) localStorage.setItem(CLE_JETON, jeton)
    else localStorage.removeItem(CLE_JETON)
  } catch {
    // Stockage indisponible : la session ne durera que le temps de la visite
  }
}

export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5000/api',
  timeout: DELAI_MAX_MS,
})

api.interceptors.request.use((config) => {
  const jeton = lireJeton()
  if (jeton) config.headers.Authorization = `Bearer ${jeton}`
  return config
})

/**
 * Appelle l'API et retourne l'enveloppe { data, meta }.
 * En cas d'échec, lève une erreur avec un message affichable, le statut HTTP et le détail par champ.
 */
export async function requete(config) {
  try {
    const reponse = await api(config)
    return reponse.data
  } catch (cause) {
    const corps = cause.response?.data
    const message = corps?.error ?? (cause.response ? 'Le serveur a rencontré une erreur.' : 'Serveur injoignable. Vérifiez votre connexion.')
    const erreur = new Error(message)
    erreur.status = cause.response?.status ?? 0
    erreur.champs = corps?.champs ?? null
    throw erreur
  }
}

// Fabrique un thunk Redux : en cas d'échec, l'erreur rejetée garde message, statut et champs
export const creerAppel = (type, appel) =>
  createAsyncThunk(type, async (argument, outils) => {
    try {
      return await appel(argument, outils)
    } catch (erreur) {
      return outils.rejectWithValue({ message: erreur.message, status: erreur.status ?? 0, champs: erreur.champs ?? null })
    }
  })

// Message d'une erreur venue de dispatch(...).unwrap()
export const messageErreur = (erreur) => erreur?.message ?? 'Une erreur est survenue.'
