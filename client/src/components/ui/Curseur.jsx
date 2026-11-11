import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const SOURIS_PRECISE = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const CIBLES_INTERACTIVES = 'a, button, [role="button"], input, select, textarea'

// Curseur personnalisé discret : un anneau ambre qui suit la souris avec un léger retard
// et s'agrandit sur les éléments cliquables. Le curseur natif reste visible.
export default function Curseur() {
  const refAnneau = useRef(null)

  useEffect(() => {
    const anneau = refAnneau.current
    const media = gsap.matchMedia()

    media.add(SOURIS_PRECISE, () => {
      const allerX = gsap.quickTo(anneau, 'x', { duration: 0.45, ease: 'power3.out' })
      const allerY = gsap.quickTo(anneau, 'y', { duration: 0.45, ease: 'power3.out' })

      const suivre = (evenement) => {
        gsap.to(anneau, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' })
        allerX(evenement.clientX)
        allerY(evenement.clientY)
        const surCible = Boolean(evenement.target.closest?.(CIBLES_INTERACTIVES))
        gsap.to(anneau, { scale: surCible ? 1.9 : 1, duration: 0.35, overwrite: 'auto' })
      }
      const masquer = () => gsap.to(anneau, { autoAlpha: 0, duration: 0.3, overwrite: 'auto' })

      window.addEventListener('pointermove', suivre, { passive: true })
      document.documentElement.addEventListener('pointerleave', masquer)

      return () => {
        window.removeEventListener('pointermove', suivre)
        document.documentElement.removeEventListener('pointerleave', masquer)
      }
    })

    return () => media.revert()
  }, [])

  return (
    <div
      ref={refAnneau}
      aria-hidden="true"
      className="pointer-events-none invisible fixed left-0 top-0 z-[70] -ml-4 -mt-4 h-8 w-8 rounded-full border border-ambre opacity-0"
    />
  )
}
