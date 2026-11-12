import { useEffect, useState } from 'react'
import Photo from '../ui/Photo'

const INTERVALLE_MS = 6000
const DELAI_CHARGEMENT_SUIVANTES_MS = 2500
const MOUVEMENT_REDUIT = '(prefers-reduced-motion: reduce)'

// Diaporama d'ambiance du hero : les photos se succèdent en fondu avec un zoom très lent.
// Seule la première image est chargée tout de suite ; les suivantes attendent la fin de l'intro.
export default function DiaporamaAmbiance({ images, sizes }) {
  const [index, setIndex] = useState(0)
  const [suivantesChargees, setSuivantesChargees] = useState(false)

  useEffect(() => {
    if (window.matchMedia(MOUVEMENT_REDUIT).matches) return undefined

    const attente = window.setTimeout(() => setSuivantesChargees(true), DELAI_CHARGEMENT_SUIVANTES_MS)
    const rotation = window.setInterval(() => setIndex((actuel) => (actuel + 1) % images.length), INTERVALLE_MS)
    return () => {
      window.clearTimeout(attente)
      window.clearInterval(rotation)
    }
  }, [images.length])

  return images.map((image, position) => {
    const premiere = position === 0
    if (!premiere && !suivantesChargees) return null
    const active = position === index

    return (
      <Photo
        key={image.id}
        image={image}
        sizes={sizes}
        prioritaire={premiere}
        aria-hidden={!active}
        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] ease-out ${
          active ? 'scale-110 opacity-100 duration-[7000ms]' : 'scale-100 opacity-0 duration-[1800ms]'
        }`}
      />
    )
  })
}
