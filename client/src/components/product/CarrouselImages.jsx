import { useRef, useState } from 'react'
import { deuxChiffres } from '../../utils/format'
import { IconeFleche } from '../ui/Icones'
import Photo from '../ui/Photo'

const SEUIL_GLISSEMENT_PX = 40

/**
 * Mini-carrousel d'images : glisser ou flèches, compteur « 01 / 04 » et barre de progression.
 * @param {{ images: { id: string, alt: string }[], sizes?: string, classeCadre?: string, classeControles?: string }} props
 */
export default function CarrouselImages({
  images,
  sizes = '(min-width: 1024px) 26vw, 90vw',
  classeCadre = '',
  classeControles = '',
}) {
  const total = images.length
  const [index, setIndex] = useState(0)
  // Seules les images déjà vues (et la suivante) sont chargées
  const [vues, setVues] = useState(() => new Set([0]))
  const departX = useRef(null)

  const aller = (cible) => {
    const suivant = (cible + total) % total
    setIndex(suivant)
    setVues((precedentes) => new Set(precedentes).add(suivant))
  }

  const debuterGlissement = (evenement) => {
    departX.current = evenement.clientX
  }

  const terminerGlissement = (evenement) => {
    if (departX.current === null) return
    const ecart = evenement.clientX - departX.current
    departX.current = null
    if (Math.abs(ecart) > SEUIL_GLISSEMENT_PX) aller(index + (ecart < 0 ? 1 : -1))
  }

  const doitCharger = (position) => vues.has(position) || position === (index + 1) % total

  return (
    <>
      <div
        data-image-carte
        className={`cursor-grab touch-pan-y select-none overflow-hidden rounded active:cursor-grabbing ${classeCadre}`}
        onPointerDown={debuterGlissement}
        onPointerUp={terminerGlissement}
        onPointerLeave={terminerGlissement}
        onPointerCancel={() => {
          departX.current = null
        }}
      >
        <div
          className="flex h-full transition-transform duration-700 ease-luxe"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((image, position) => (
            <div key={image.id} className="h-full min-w-full overflow-hidden" aria-hidden={position !== index}>
              {doitCharger(position) && (
                <Photo
                  image={image}
                  sizes={sizes}
                  className="h-full w-full object-cover transition-transform duration-[1400ms] ease-luxe [filter:sepia(0.14)] group-hover:scale-105"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={`flex items-center justify-between gap-4 ${classeControles}`}>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => aller(index - 1)}
            aria-label="Image précédente"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-sable transition-colors duration-300 hover:border-brun"
          >
            <IconeFleche direction="gauche" width={13} height={13} />
          </button>
          <button
            type="button"
            onClick={() => aller(index + 1)}
            aria-label="Image suivante"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-sable transition-colors duration-300 hover:border-brun"
          >
            <IconeFleche width={13} height={13} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="label tabular-nums" aria-live="polite">
            {deuxChiffres(index + 1)} / {deuxChiffres(total)}
          </span>
          <span className="relative block h-px w-16 bg-sable" aria-hidden="true">
            <span
              className="absolute inset-y-0 left-0 bg-brun transition-[width] duration-700 ease-luxe"
              style={{ width: `${((index + 1) / total) * 100}%` }}
            />
          </span>
        </div>
      </div>
    </>
  )
}
