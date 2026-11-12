import { useEffect } from 'react'
import { bloquerDefilement, debloquerDefilement } from '../utils/defilement'

const ZONES_INERTES = ['#contenu', 'header', 'footer']

function rendreInerte(inerte) {
  ZONES_INERTES.forEach((selecteur) => {
    document.querySelector(selecteur)?.toggleAttribute('inert', inerte)
  })
}

// Comportement commun aux overlays (menu, tiroir panier) : bloque le défilement, rend le reste
// de la page inerte (le focus reste dans le dialogue), ferme avec Échap et rend le focus à la fermeture.
export function useOverlay(estOuvert, fermer) {
  useEffect(() => {
    if (!estOuvert) return undefined

    const declencheur = document.activeElement
    bloquerDefilement()
    rendreInerte(true)
    const surTouche = (evenement) => {
      if (evenement.key === 'Escape') fermer()
    }
    window.addEventListener('keydown', surTouche)

    return () => {
      window.removeEventListener('keydown', surTouche)
      debloquerDefilement()
      rendreInerte(false)
      declencheur?.focus?.()
    }
  }, [estOuvert, fermer])
}
