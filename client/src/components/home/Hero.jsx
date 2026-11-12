import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { CLIP_CACHE, CLIP_VISIBLE, MOUVEMENT_AUTORISE } from '../../hooks/useRevelations'
import { delaiIntro } from '../../utils/intro'
import Compteur from '../ui/Compteur'
import Etoile from '../ui/Etoile'
import { IconeFleche } from '../ui/Icones'
import Photo from '../ui/Photo'
import { SoulignementVague } from '../ui/Vague'

gsap.registerPlugin(ScrollTrigger)

const MOTS_DU_TITRE = ["L'art", 'marocain,', 'façonné', 'à', 'la', 'main.']
const MOTS_ACCENTUES = new Set(['façonné'])

const IMAGE_AMBIANCE = {
  id: '1505576391880-b3f9d713dc4f',
  alt: "Galerie d'un riad aux murs ocre baignée de lumière dorée",
}
const IMAGE_FLOTTANTE = {
  id: '1618722060945-b87f7326995b',
  alt: 'Amphore en terre cuite tournée à la main',
}

const CHIFFRES = [
  { valeur: 120, suffixe: '+', texte: 'Artisans partenaires' },
  { valeur: 12, suffixe: '', texte: 'Régions du Maroc' },
  { valeur: 4.9, suffixe: ' / 5', texte: 'Avis clients', decimales: 1 },
]

// Hero multi-couches : titre révélé mot par mot, photo dévoilée par clip-path,
// parallaxe souris + scroll sur la photo et les éléments décoratifs, CTA en fondu.
export default function Hero() {
  const refHero = useRef(null)
  // On attend la fin de l'écran de chargement (ou du rideau de transition) avant de lancer l'intro
  const [delai] = useState(delaiIntro)

  useLayoutEffect(() => {
    const media = gsap.matchMedia()

    media.add(
      MOUVEMENT_AUTORISE,
      () => {
        const intro = gsap.timeline({ delay: delai, defaults: { ease: 'power3.out' } })
        intro
          .fromTo(
            '[data-hero-cadre]',
            { clipPath: CLIP_CACHE },
            { clipPath: CLIP_VISIBLE, duration: 1.5, ease: 'power4.inOut' },
            0,
          )
          .from('[data-hero-photo]', { scale: 1.35, duration: 2, ease: 'power3.out' }, 0)
          .from('[data-hero-mot]', { yPercent: 115, duration: 1.1, stagger: 0.09, ease: 'power4.out' }, 0.2)
          .from('[data-hero-fondu]', { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.12 }, 0.9)
          .from('[data-hero-flottant]', { autoAlpha: 0, y: 60, duration: 1.2 }, 1)
          .fromTo(
            '[data-vague]',
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' },
            1.1,
          )
          .from('[data-hero-cta]', { autoAlpha: 0, duration: 1.2, ease: 'power2.out' }, 1.5)

        // Parallaxe au scroll : la photo glisse plus lentement que la page
        gsap.to('[data-hero-photo]', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: refHero.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to('[data-hero-flottant]', {
          yPercent: -35,
          ease: 'none',
          scrollTrigger: { trigger: refHero.current, start: 'top top', end: 'bottom top', scrub: true },
        })

        // Parallaxe à la souris : chaque couche bouge selon sa profondeur
        const couches = gsap.utils.toArray('[data-profondeur]').map((element) => ({
          profondeur: Number(element.dataset.profondeur),
          allerX: gsap.quickTo(element, 'x', { duration: 0.9, ease: 'power3.out' }),
          allerY: gsap.quickTo(element, 'y', { duration: 0.9, ease: 'power3.out' }),
        }))

        const surSouris = (evenement) => {
          const ratioX = evenement.clientX / window.innerWidth - 0.5
          const ratioY = evenement.clientY / window.innerHeight - 0.5
          couches.forEach((couche) => {
            couche.allerX(ratioX * couche.profondeur)
            couche.allerY(ratioY * couche.profondeur)
          })
        }

        const hero = refHero.current
        hero.addEventListener('pointermove', surSouris, { passive: true })
        return () => hero.removeEventListener('pointermove', surSouris)
      },
      refHero,
    )

    return () => media.revert()
  }, [delai])

  return (
    <section
      ref={refHero}
      className="relative grid min-h-[100svh] grid-cols-1 border-b border-sable pt-entete lg:grid-cols-12"
    >
      {/* Colonne texte */}
      <div className="flex flex-col px-gouttiere pb-[clamp(64px,9vw,140px)] pt-10 lg:col-span-7 lg:pt-14">
        <p data-hero-fondu className="label flex items-center gap-3 text-cuivre">
          <span className="h-px w-10 bg-cuivre" aria-hidden="true" />
          Artisanat marocain · Collection 2026
        </p>

        <h1 className="mt-8 text-hero lg:mt-auto">
          {MOTS_DU_TITRE.map((mot) => (
            <span key={mot} className="relative mr-[0.22em] inline-block align-bottom">
              <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span
                  data-hero-mot
                  className={`inline-block ${MOTS_ACCENTUES.has(mot) ? 'text-ambre' : ''}`}
                >
                  {mot}
                </span>
              </span>
              {MOTS_ACCENTUES.has(mot) && <SoulignementVague className="text-ambre" />}
            </span>
          ))}
        </h1>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between lg:mt-10">
          <p data-hero-fondu className="max-w-sm text-[16px] text-brun/80">
            Tapis berbères, poteries, cuirs et soins naturels, choisis dans les ateliers de
            l'Atlas, de Fès et de Safi — et livrés partout au Maroc.
          </p>
          <Link data-hero-cta to="/catalogue" className="btn btn-plein group h-14 shrink-0 px-8">
            Découvrir la collection
            <IconeFleche className="transition-transform duration-300 ease-luxe group-hover:translate-x-1" />
          </Link>
        </div>

        <dl className="mt-10 grid grid-cols-3 border-t border-sable pt-6 lg:mt-14">
          {CHIFFRES.map((chiffre) => (
            <div key={chiffre.texte} data-hero-fondu>
              <dd className="text-[clamp(24px,3vw,44px)] leading-none tracking-[-0.03em]">
                <Compteur
                  valeur={chiffre.valeur}
                  suffixe={chiffre.suffixe}
                  decimales={chiffre.decimales}
                  delai={delai + 1}
                />
              </dd>
              <dt className="label mt-2 text-cuivre">{chiffre.texte}</dt>
            </div>
          ))}
        </dl>
      </div>

      {/* Colonne image : photo d'ambiance + éléments décoratifs en couches */}
      <div className="relative min-h-[70svh] lg:col-span-5 lg:min-h-0">
        <div data-hero-cadre className="absolute inset-0 overflow-hidden bg-sable">
          <div data-profondeur="-18" className="absolute -inset-[5%]">
            <Photo
              data-hero-photo
              image={IMAGE_AMBIANCE}
              sizes="(min-width: 1024px) 42vw, 100vw"
              prioritaire
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Carte flottante qui chevauche les deux colonnes */}
        <div
          data-hero-flottant
          className="absolute bottom-10 left-6 z-10 w-36 sm:w-44 lg:-left-10 lg:bottom-16 lg:w-48"
        >
          <div data-profondeur="34" className="rounded border border-sable bg-creme p-2">
            <Photo
              image={IMAGE_FLOTTANTE}
              sizes="200px"
              prioritaire
              className="aspect-[4/5] w-full rounded object-cover"
            />
            <p className="label mt-2 flex justify-between px-1 pb-1">
              <span>Amphore Zagora</span>
              <span className="text-ambre">N° 04</span>
            </p>
          </div>
        </div>

        {/* Sceau circulaire en rotation lente */}
        <div data-hero-fondu className="absolute right-6 top-6 z-10 lg:right-10 lg:top-10">
          <div
            data-profondeur="22"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-creme/90 backdrop-blur sm:h-28 sm:w-28"
          >
            <svg viewBox="0 0 100 100" className="h-full w-full animate-tourne" aria-hidden="true">
              <defs>
                <path id="cercle-sceau" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
              </defs>
              <text className="fill-brun text-[9.5px] font-medium uppercase tracking-[0.2em]">
                <textPath href="#cercle-sceau">Fait main au Maroc · Fait main au Maroc ·</textPath>
              </text>
            </svg>
            <Etoile className="absolute h-7 w-7 text-ambre" />
          </div>
          <span className="sr-only">Fait main au Maroc</span>
        </div>
      </div>
    </section>
  )
}
