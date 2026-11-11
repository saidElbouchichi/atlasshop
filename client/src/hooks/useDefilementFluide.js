import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { definirLenis } from '../utils/defilement'

gsap.registerPlugin(ScrollTrigger)

const REQUETE_MOUVEMENT_REDUIT = '(prefers-reduced-motion: reduce)'

// Active Lenis (smooth scroll) et le synchronise avec GSAP ScrollTrigger.
// Désactivé si l'utilisateur préfère réduire les animations.
export function useDefilementFluide() {
  useEffect(() => {
    if (window.matchMedia(REQUETE_MOUVEMENT_REDUIT).matches) return undefined

    const lenis = new Lenis({ duration: 1.1 })
    definirLenis(lenis)
    lenis.on('scroll', ScrollTrigger.update)

    const avancer = (temps) => lenis.raf(temps * 1000)
    gsap.ticker.add(avancer)
    gsap.ticker.lagSmoothing(0)

    // Les polices changent la hauteur des blocs : on recalcule les déclencheurs
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      gsap.ticker.remove(avancer)
      lenis.destroy()
      definirLenis(null)
    }
  }, [])
}
