import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CLIP_CACHE, CLIP_VISIBLE, MOUVEMENT_AUTORISE } from '../../hooks/useRevelations'
import CarteProduit from './CarteProduit'

gsap.registerPlugin(ScrollTrigger)

const DECALAGE_ENTRE_CARTES = 0.1

// Grille catalogue : 2 grandes cartes par ligne sur desktop, 1 sur mobile.
// Les fines lignes entre les cartes viennent du fond « sable » visible dans l'espace de 1px.
export default function GrilleProduits({ produits }) {
  const refGrille = useRef(null)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()

    media.add(
      MOUVEMENT_AUTORISE,
      () => {
        const cartes = gsap.utils.toArray('[data-carte-produit]')
        const images = gsap.utils.toArray('[data-image-carte]')
        // On anime les deux zones de la carte, pas la carte : son fond beige reste en place
        const zonesDe = (carte) => Array.from(carte.children)
        gsap.set(cartes.flatMap(zonesDe), { autoAlpha: 0, y: 48 })
        gsap.set(images, { clipPath: CLIP_CACHE })

        // La carte monte en fondu, puis son image se révèle par clip-path
        ScrollTrigger.batch(cartes, {
          start: 'top 85%',
          once: true,
          onEnter: (lot) => {
            lot.forEach((carte, position) => {
              const delai = position * DECALAGE_ENTRE_CARTES
              gsap.to(zonesDe(carte), { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: delai })
              gsap.to(carte.querySelector('[data-image-carte]'), {
                clipPath: CLIP_VISIBLE,
                duration: 1.2,
                ease: 'power4.inOut',
                delay: delai + 0.25,
              })
            })
          },
        })
      },
      refGrille,
    )

    return () => media.revert()
  }, [produits])

  return (
    <div
      ref={refGrille}
      className="grid grid-cols-1 gap-px border border-sable bg-sable lg:grid-cols-2"
    >
      {produits.map((produit) => (
        <CarteProduit key={produit._id} produit={produit} />
      ))}
    </div>
  )
}
