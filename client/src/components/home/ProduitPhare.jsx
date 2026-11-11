import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { variantesPhares } from '../../data/products'
import { useAjoutPanier } from '../../hooks/useAjoutPanier'
import { useRevelations } from '../../hooks/useRevelations'
import { formaterPrix } from '../../utils/format'
import { lienWhatsApp, messageConseilProduit } from '../../utils/whatsapp'
import CarrouselImages from '../product/CarrouselImages'
import { IconeWhatsApp } from '../ui/Icones'
import Photo from '../ui/Photo'

const IMAGE_SALON = {
  id: '1616047006789-b7af5afb8c20',
  alt: 'Salon lumineux aux tons naturels avec un tapis berbère au sol',
}

function CarteVariante({ produit }) {
  const ajouter = useAjoutPanier()
  const lienFiche = `/produit/${produit.slug}`

  return (
    <article data-reveal className="group flex flex-col bg-beige p-6 xl:p-10">
      <div className="flex aspect-square flex-col overflow-hidden sm:aspect-[4/3]">
        <CarrouselImages
          images={produit.images}
          sizes="(min-width: 1024px) 44vw, 90vw"
          classeCadre="min-h-0 flex-1"
          classeControles="mt-4 shrink-0"
        />
      </div>

      <div className="mt-8 flex items-start justify-between gap-6">
        <div>
          <h4 className="text-[22px] uppercase leading-tight tracking-[0.02em]">{produit.name}</h4>
          <p className="mt-1 text-taupe">{produit.subtitle}</p>
        </div>
        <p className="shrink-0 text-[22px] tracking-[-0.01em] text-ambre">{formaterPrix(produit.price)}</p>
      </div>

      <dl className="mt-6 border-t border-sable">
        {produit.specs.map((caracteristique) => (
          <div
            key={caracteristique.label}
            className="flex items-baseline justify-between gap-4 border-b border-sable py-3"
          >
            <dt className="text-mini uppercase text-taupe">{caracteristique.label}</dt>
            <dd className="text-right text-[14px]">{caracteristique.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => ajouter(produit)} className="btn btn-plein flex-1">
          Ajouter au panier
        </button>
        <Link to={lienFiche} className="btn btn-contour flex-1">
          Voir en détail
        </Link>
      </div>
    </article>
  )
}

// Produit phare en affichage « split », puis le bloc « Choisissez votre pièce »
export default function ProduitPhare() {
  const refSection = useRef(null)
  useRevelations(refSection)

  return (
    <section ref={refSection} aria-labelledby="titre-phare">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-between gap-16 px-gouttiere py-20 lg:py-28">
          <p data-reveal className="label flex items-center gap-3 text-taupe">
            <span className="h-px w-10 bg-taupe" aria-hidden="true" />
            Pièce phare · Moyen Atlas
          </p>

          <div>
            <h2 id="titre-phare" data-reveal className="text-titre">
              Tapis Beni Ouarain
            </h2>
            <p data-reveal className="mt-8 max-w-md text-[16px] text-brun/80">
              Noué point par point par les tisseuses de la tribu Beni Ouarain, en laine vierge non
              teinte. Chaque losange est tracé de mémoire : il n'existe pas deux tapis identiques.
            </p>
            <a
              data-reveal
              href={lienWhatsApp(messageConseilProduit('Tapis Beni Ouarain'))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-contour mt-10"
            >
              <IconeWhatsApp width={16} height={16} />
              Demander conseil
            </a>
          </div>
        </div>

        <div data-reveal-clip className="relative min-h-[70svh] overflow-hidden bg-sable lg:min-h-[105vh]">
          <div className="absolute -inset-y-[8%] inset-x-0">
            <Photo
              data-parallaxe
              image={IMAGE_SALON}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <div className="border-y border-sable bg-beige px-gouttiere py-20 lg:py-24">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h3 data-reveal className="text-sous-titre">
            Choisissez votre pièce
          </h3>
          <p data-reveal className="label text-taupe">
            02 formats · nouage main
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-px border border-sable bg-sable lg:grid-cols-2">
          {variantesPhares.map((produit) => (
            <CarteVariante key={produit._id} produit={produit} />
          ))}
        </div>
      </div>
    </section>
  )
}
