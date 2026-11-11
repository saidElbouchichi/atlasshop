import { useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const MOUVEMENT_AUTORISE = '(prefers-reduced-motion: no-preference)'
export const CLIP_CACHE = 'inset(100% 0% 0% 0%)'
export const CLIP_VISIBLE = 'inset(0% 0% 0% 0%)'

const DEPART_SCROLL = 'top 88%'

// Révèle au scroll les éléments marqués dans la section :
//   data-reveal        -> fondu montant
//   data-reveal-clip   -> révélation par clip-path (images)
//   data-parallaxe     -> léger déplacement vertical lié au scroll
export function useRevelations(refSection) {
  useLayoutEffect(() => {
    const media = gsap.matchMedia()

    media.add(
      MOUVEMENT_AUTORISE,
      () => {
        gsap.utils.toArray('[data-reveal]', refSection.current).forEach((element) => {
          gsap.from(element, {
            autoAlpha: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: DEPART_SCROLL, once: true },
          })
        })

        gsap.utils.toArray('[data-reveal-clip]', refSection.current).forEach((element) => {
          gsap.fromTo(
            element,
            { clipPath: CLIP_CACHE },
            {
              clipPath: CLIP_VISIBLE,
              duration: 1.4,
              ease: 'power4.inOut',
              scrollTrigger: { trigger: element, start: DEPART_SCROLL, once: true },
            },
          )
        })

        gsap.utils.toArray('[data-parallaxe]', refSection.current).forEach((element) => {
          gsap.fromTo(
            element,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: 'none',
              scrollTrigger: {
                trigger: element.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        })
      },
      refSection,
    )

    return () => media.revert()
  }, [refSection])
}
