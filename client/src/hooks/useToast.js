import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { afficherToast } from '../store/slices/uiSlice'

// Affiche une notification : toast('Produit enregistré') ou toast('Erreur…', 'erreur')
export function useToast() {
  const dispatch = useDispatch()
  return useCallback((message, type) => dispatch(afficherToast(message, type)), [dispatch])
}
