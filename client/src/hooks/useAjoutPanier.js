import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { ajouterAuPanier } from '../store/slices/cartSlice'
import { ouvrirPanier } from '../store/slices/uiSlice'

// Ajoute un produit au panier puis ouvre le tiroir pour confirmer visuellement l'ajout
export function useAjoutPanier() {
  const dispatch = useDispatch()

  return useCallback(
    (produit, qty = 1) => {
      dispatch(ajouterAuPanier({ produit, qty }))
      dispatch(ouvrirPanier())
    },
    [dispatch],
  )
}
