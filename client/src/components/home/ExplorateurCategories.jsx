import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { MOUVEMENT_AUTORISE, useRevelations } from '../../hooks/useRevelations'
import { selectCategories } from '../../store/slices/categoriesSlice'
import { selectProduits } from '../../store/slices/productsSlice'
import { deuxChiffres } from '../../utils/format'
import { IconeFleche } from '../ui/Icones'
import { MotsReveles } from '../ui/Mouvement'
import Photo from '../ui/Photo'

// Explorateur de catégories : une liste de grands noms ; au survol, la photo de la catégorie
// apparaît et suit le curseur. Sur mobile, une vignette est affichée dans chaque ligne.
export default function ExplorateurCategories() {
  const refSection = useRef(null)
  const refApercu = useRef(null)
  const categories = useSelector(selectCategories)
  const produits = useSelector(selectProduits)
  const [active, setActive] = useState(null)
  useRevelations(refSection)

  const nombreDePieces = (slug) => produits.filter((produit) => produit.category === slug).length
  const categorieActive = categories.find((categorie) => categorie._id === active)

  // L'aperçu suit le curseur avec un léger retard
  useLayoutEffect(() => {
    const section = refSection.current
    const media = gsap.matchMedia()

    media.add(MOUVEMENT_AUTORISE, () => {
      const allerX = gsap.quickTo(refApercu.current, 'x', { duration: 0.6, ease: 'power3.out' })
      const allerY = gsap.quickTo(refApercu.current, 'y', { duration: 0.6, ease: 'power3.out' })
      const suivre = (evenement) => {
        const cadre = section.getBoundingClientRect()
        allerX(evenement.clientX - cadre.left)
        allerY(evenement.clientY - cadre.top)
      }
      section.addEventListener('pointermove', suivre, { passive: true })
      return () => section.removeEventListener('pointermove', suivre)
    })

    return () => media.revert()
  }, [])

  return (
    <section
      ref={refSection}
      aria-labelledby="titre-categories"
      className="relative px-gouttiere py-20 lg:py-28"
      onPointerLeave={() => setActive(null)}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p data-reveal className="label flex items-center gap-3 text-cuivre">
            <span className="h-px w-10 bg-cuivre" aria-hidden="true" />
            Explorer · {deuxChiffres(categories.length)} univers
          </p>
          <h2 id="titre-categories" data-titre-mots className="mt-6 text-titre">
            <MotsReveles texte="Par matière, par geste" />
          </h2>
        </div>
        <p data-reveal className="max-w-sm text-brun/80">
          Chaque univers réunit un savoir-faire et une région. Entrez dans celui qui vous ressemble.
        </p>
      </div>

      <ul className="mt-14 border-t border-sable">
        {categories.map((categorie, position) => (
          <li key={categorie._id} data-reveal className="border-b border-sable">
            <Link
              to={`/catalogue?category=${categorie.slug}`}
              onPointerEnter={() => setActive(categorie._id)}
              onFocus={() => setActive(categorie._id)}
              onBlur={() => setActive(null)}
              className="group flex items-center gap-4 py-5 transition-colors duration-300 hover:text-ambre focus-visible:text-ambre sm:gap-8 sm:py-7"
            >
              <span className="label w-8 shrink-0 text-cuivre">{deuxChiffres(position + 1)}</span>
              <span className="flex-1 text-[clamp(30px,5.4vw,84px)] leading-none tracking-[-0.04em] transition-transform duration-500 ease-luxe group-hover:translate-x-4">
                {categorie.name}
              </span>
              {categorie.image && (
                <Photo image={categorie.image} sizes="64px" className="h-14 w-12 shrink-0 rounded object-cover lg:hidden" />
              )}
              <span className="label hidden shrink-0 text-cuivre sm:block">
                {deuxChiffres(nombreDePieces(categorie.slug))} pièce{nombreDePieces(categorie.slug) > 1 ? 's' : ''}
              </span>
              <IconeFleche className="shrink-0 transition-transform duration-500 ease-luxe group-hover:translate-x-2" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Aperçu flottant (grand écran) : la photo de la catégorie survolée */}
      <div
        ref={refApercu}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
      >
        <div
          className={`-ml-28 -mt-36 h-72 w-56 overflow-hidden rounded border border-sable bg-sable transition-[opacity,transform,clip-path] duration-500 ease-luxe ${
            categorieActive?.image ? 'scale-100 opacity-100 [clip-path:inset(0%)]' : 'scale-90 opacity-0 [clip-path:inset(50%_0%_50%_0%)]'
          }`}
        >
          {categories.map(
            (categorie) =>
              categorie.image && (
                <Photo
                  key={categorie._id}
                  image={categorie.image}
                  sizes="240px"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 [filter:sepia(0.14)] ${
                    categorie._id === active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ),
          )}
        </div>
      </div>
    </section>
  )
}
