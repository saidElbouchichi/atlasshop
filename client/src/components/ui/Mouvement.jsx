import { Fragment, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { motion, useScroll, useSpring } from 'framer-motion'
import { useDefilementDepasse } from '../../hooks/useDefilementDepasse'
import { defilerEnHaut } from '../../utils/defilement'
import Etoile from './Etoile'

const SOURIS_PRECISE = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const SEUIL_RETOUR_EN_HAUT = 700
const FORCE_AIMANT = 0.3

/**
 * Titre révélé mot par mot : chaque mot monte depuis un masque.
 * À placer dans un élément portant `data-titre-mots` (animé par useRevelations).
 */
export function MotsReveles({ texte }) {
  return texte.split(' ').map((mot, position) => (
    // eslint-disable-next-line react/no-array-index-key -- un titre peut répéter un mot
    <Fragment key={position}>
      <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
        <span data-mot className="inline-block">
          {mot}
        </span>
      </span>{' '}
    </Fragment>
  ))
}

// Fine barre ambre en haut de l'écran : avancement de la lecture de la page
export function BarreProgression() {
  const { scrollYProgress } = useScroll()
  const avancement = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[3px] origin-left bg-ambre"
      style={{ scaleX: avancement }}
    />
  )
}

// Bouton « retour en haut » : l'étoile du logo, visible après un certain défilement
export function RetourEnHaut() {
  const visible = useDefilementDepasse(SEUIL_RETOUR_EN_HAUT)

  return (
    <button
      type="button"
      onClick={defilerEnHaut}
      aria-label="Revenir en haut de la page"
      tabIndex={visible ? 0 : -1}
      className={`group fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-brun bg-creme transition-all duration-500 ease-luxe hover:border-ambre hover:bg-ambre ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <Etoile className="h-5 w-5 text-ambre transition-transform duration-700 ease-luxe group-hover:rotate-90 group-hover:text-brun" />
    </button>
  )
}

// Effet « aimant » : l'élément suit légèrement le curseur quand on l'approche (souris uniquement)
export function Aimant({ children, className = '' }) {
  const refAimant = useRef(null)

  useEffect(() => {
    const element = refAimant.current
    const media = gsap.matchMedia()

    media.add(SOURIS_PRECISE, () => {
      const allerX = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' })
      const allerY = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' })

      const attirer = (evenement) => {
        const cadre = element.getBoundingClientRect()
        allerX((evenement.clientX - (cadre.left + cadre.width / 2)) * FORCE_AIMANT)
        allerY((evenement.clientY - (cadre.top + cadre.height / 2)) * FORCE_AIMANT)
      }
      const relacher = () => {
        allerX(0)
        allerY(0)
      }

      element.addEventListener('pointermove', attirer)
      element.addEventListener('pointerleave', relacher)
      return () => {
        element.removeEventListener('pointermove', attirer)
        element.removeEventListener('pointerleave', relacher)
      }
    })

    return () => media.revert()
  }, [])

  return (
    <span ref={refAimant} className={`inline-block ${className}`}>
      {children}
    </span>
  )
}
