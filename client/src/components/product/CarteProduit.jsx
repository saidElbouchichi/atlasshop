import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useAjoutPanier } from '../../hooks/useAjoutPanier'
import { selectNomCategorie } from '../../store/slices/categoriesSlice'
import { formaterPrix } from '../../utils/format'
import { IconeFleche } from '../ui/Icones'
import CarrouselImages from './CarrouselImages'

// Carte produit « fiche technique luxe » : texte à gauche (~45 %), image à droite (~55 %)
export default function CarteProduit({ produit }) {
  const ajouter = useAjoutPanier()
  const nomCategorie = useSelector(selectNomCategorie(produit.category))
  const lienFiche = `/produit/${produit.slug}`

  return (
    <article
      data-carte-produit
      className="group grid grid-cols-1 bg-beige sm:grid-cols-[45%_55%]"
    >
      <div className="order-2 flex flex-col p-6 sm:order-1 xl:p-8">
        <span className="w-fit rounded bg-brun px-2 py-1 text-mini font-medium uppercase text-creme">
          {nomCategorie}
        </span>

        <h3 className="mt-5 text-[28px] leading-[1.05] tracking-[-0.03em]">
          <Link to={lienFiche}>{produit.name}</Link>
        </h3>
        <p className="mt-2 text-[20px] tracking-[-0.01em] text-ambre">{formaterPrix(produit.price)}</p>

        <p className="label mt-6 text-cuivre">Description :</p>
        <p className="mt-1.5 line-clamp-3 text-label uppercase text-brun/80">{produit.description}</p>

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-sable pt-5">
          {produit.specs.map((caracteristique) => (
            <div key={caracteristique.label}>
              <dt className="text-mini uppercase text-cuivre">{caracteristique.label}</dt>
              <dd className="mt-0.5 text-[13px] leading-snug">{caracteristique.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto pt-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => ajouter(produit)}
              className="btn flex-1 border-brun px-3 group-hover:border-ambre group-hover:bg-ambre"
            >
              Ajouter au panier
            </button>
            <Link
              to={lienFiche}
              aria-label={`Voir la fiche de ${produit.name}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brun transition-colors duration-300 hover:bg-brun hover:text-creme"
            >
              <IconeFleche className="transition-transform duration-300 ease-luxe group-hover:translate-x-1" />
            </Link>
          </div>
          <Link to={lienFiche} className="lien-ambre mt-4 inline-block">
            Voir les détails
          </Link>
        </div>
      </div>

      <div className="relative order-1 flex aspect-square flex-col overflow-hidden border-b border-sable p-6 sm:order-2 sm:aspect-auto sm:min-h-[560px] sm:border-b-0 sm:border-l xl:p-10">
        <CarrouselImages
          images={produit.images}
          classeCadre="min-h-0 flex-1"
          classeControles="mt-5 shrink-0"
        />
      </div>
    </article>
  )
}
