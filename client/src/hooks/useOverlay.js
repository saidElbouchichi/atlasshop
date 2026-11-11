import { useEffect } from 'react'
import { bloquerDefilement, debloquerDefilement } from '../utils/defilement'

// Comportement commun aux overlays (menu, tiroir panier) :
// bloque le défilement de la page et ferme avec la touche Échap.
export function useOverlay(estOuvert, fermer) {
  useEffect(() => {
    if (!estOuvert) return undefined

    bloquerDefilement()
    const surTouche = (evenement) => {
      if (evenement.key === 'Escape') fermer()
    }
    window.addEventListener('keydown', surTouche)

    return () => {
      window.removeEventListener('keydown', surTouche)
      debloquerDefilement()
    }
  }, [estOuvert, fermer])
}
