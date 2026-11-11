import { useRef } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useRevelations } from '../../hooks/useRevelations'
import { selectProduitsVedettes } from '../../store/slices/productsSlice'
import { deuxChiffres } from '../../utils/format'
import GrilleProduits from '../product/GrilleProduits'

// Grille des produits vedettes au style « fiche technique »
export default function SelectionVedette() {
  const refSection = useRef(null)
  const produits = useSelector(selectProduitsVedettes)
  useRevelations(refSection)

  return (
    <section ref={refSection} aria-labelledby="titre-selection" className="px-gouttiere py-20 lg:py-28">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p data-reveal className="label flex items-center gap-3 text-taupe">
            <span className="h-px w-10 bg-taupe" aria-hidden="true" />
            La sélection · {deuxChiffres(produits.length)} pièces
          </p>
          <h2 id="titre-selection" data-reveal className="mt-6 max-w-3xl text-titre">
            Des pièces choisies à l'atelier
          </h2>
        </div>
        <Link data-reveal to="/catalogue" className="lien-ambre shrink-0">
          Voir tout le catalogue
        </Link>
      </div>

      <div className="mt-14">
        <GrilleProduits produits={produits} />
      </div>
    </section>
  )
}
