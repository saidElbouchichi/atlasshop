import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MOUVEMENT_AUTORISE } from '../../hooks/useRevelations'

gsap.registerPlugin(ScrollTrigger)

const DUREE_SECONDES = 2.2

function formater(valeur, decimales) {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

// Chiffre qui s'incrémente quand il entre dans l'écran.
// Sans animation (mouvement réduit), la valeur finale est affichée directement.
export default function Compteur({ valeur, suffixe = '', decimales = 0, delai = 0 }) {
  const refNombre = useRef(null)

  useLayoutEffect(() => {
    const element = refNombre.current
    const media = gsap.matchMedia()

    media.add(MOUVEMENT_AUTORISE, () => {
      const etat = { courant: 0 }
      element.textContent = formater(0, decimales)
      gsap.to(etat, {
        courant: valeur,
        duration: DUREE_SECONDES,
        delay: delai,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 95%', once: true },
        onUpdate: () => {
          element.textContent = formater(etat.courant, decimales)
        },
      })
      return () => {
        element.textContent = formater(valeur, decimales)
      }
    })

    return () => media.revert()
  }, [valeur, decimales, delai])

  return (
    <span className="tabular-nums">
      <span ref={refNombre}>{formater(valeur, decimales)}</span>
      {suffixe}
    </span>
  )
}
