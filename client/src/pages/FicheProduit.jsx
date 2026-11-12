import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import AvisProduit from '../components/product/AvisProduit'
import GrilleProduits from '../components/product/GrilleProduits'
import { SeparateurEtoile } from '../components/ui/Etoile'
import { Note, SelecteurQuantite } from '../components/ui/Formulaire'
import { IconeWhatsApp } from '../components/ui/Icones'
import Photo from '../components/ui/Photo'
import { useAjoutPanier } from '../hooks/useAjoutPanier'
import { useRevelations } from '../hooks/useRevelations'
import { selectNomCategorie } from '../store/slices/categoriesSlice'
import { selectProduitParSlug, selectProduits } from '../store/slices/productsSlice'
import { formaterPrix } from '../utils/format'
import { cleImage } from '../utils/images'
import { lienWhatsApp, messageConseilProduit } from '../utils/whatsapp'
import PageIntrouvable from './PageIntrouvable'

const CONSEILS_ENTRETIEN = {
  tapis: ['Aspirer sans brosse rotative, dans le sens du poil.', 'Aérer à l’ombre deux fois par an.', 'Tamponner une tache à l’eau tiède, sans frotter.'],
  poterie: ['Laver à la main, à l’eau tiède.', 'Éviter les chocs thermiques brutaux.', 'Sécher complètement avant de ranger.'],
  cuir: ['Nourrir le cuir deux fois par an avec un baume incolore.', 'Tenir à l’écart de la pluie et du soleil direct.', 'Ranger garni de papier pour garder la forme.'],
  cosmetiques: ['Conserver à l’abri de la chaleur et de la lumière.', 'Utiliser dans les 12 mois après ouverture.', 'Refermer soigneusement après usage.'],
  decoration: ['Dépoussiérer avec un chiffon doux et sec.', 'Éviter l’humidité prolongée.', 'Ne pas utiliser de produit abrasif.'],
}
const CONSEILS_PAR_DEFAUT = ['Dépoussiérer avec un chiffon doux.', 'Tenir à l’abri de l’humidité.']

// Galerie sticky : grande image + vignettes
function Galerie({ produit }) {
  const [index, setIndex] = useState(0)
  const image = produit.images[Math.min(index, produit.images.length - 1)]

  return (
    <div className="lg:sticky lg:top-entete lg:h-[calc(100svh-theme(spacing.entete))]">
      <div className="flex h-full flex-col gap-4 p-6 xl:p-10">
        <div data-reveal-clip className="aspect-square min-h-0 overflow-hidden rounded bg-sable lg:aspect-auto lg:flex-1">
          <Photo image={image} sizes="(min-width: 1024px) 50vw, 100vw" prioritaire className="h-full w-full object-cover [filter:sepia(0.14)]" />
        </div>
        <ul className="grid shrink-0 grid-cols-4 gap-3">
          {produit.images.map((vignette, position) => (
            <li key={cleImage(vignette)}>
              <button
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Afficher l'image ${position + 1}`}
                aria-current={position === index}
                className={`block aspect-square w-full overflow-hidden rounded border transition-colors duration-300 ${
                  position === index ? 'border-brun' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <Photo image={vignette} sizes="120px" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function InfosProduit({ produit }) {
  const ajouter = useAjoutPanier()
  const nomCategorie = useSelector(selectNomCategorie(produit.category))
  const [quantite, setQuantite] = useState(1)
  const enStock = produit.stock > 0

  return (
    <div className="flex flex-col border-sable px-gouttiere py-10 lg:border-l lg:py-16 xl:px-16">
      <nav aria-label="Fil d'Ariane" className="label text-cuivre">
        <Link to="/catalogue" className="hover:text-brun">Catalogue</Link> / <Link to={`/catalogue?category=${produit.category}`} className="hover:text-brun">{nomCategorie}</Link>
      </nav>

      <span data-reveal className="mt-8 w-fit rounded bg-brun px-2 py-1 text-mini font-medium uppercase text-creme">{nomCategorie}</span>
      <h1 data-reveal className="mt-5 text-titre">{produit.name}</h1>
      <div data-reveal className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <p className="text-[28px] tracking-[-0.02em] text-ambre">{formaterPrix(produit.price)}</p>
        <p className="flex items-center gap-2 text-[13px] text-cuivre">
          <Note valeur={produit.rating} /> {produit.rating.toLocaleString('fr-FR')} · {produit.numReviews} avis
        </p>
      </div>

      <p className="label mt-10 text-cuivre">Description :</p>
      <p data-reveal className="mt-2 max-w-lg text-[16px] text-brun/80">{produit.description}</p>

      <dl className="mt-10 border-t border-sable">
        {[...produit.specs, { label: 'Artisan', value: produit.artisan }].map((caracteristique) => (
          <div key={caracteristique.label} className="flex items-baseline justify-between gap-4 border-b border-sable py-3">
            <dt className="text-mini uppercase text-cuivre">{caracteristique.label}</dt>
            <dd className="text-right text-[14px]">{caracteristique.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <SelecteurQuantite valeur={quantite} max={produit.stock} surChangement={setQuantite} grand />
        <button type="button" onClick={() => ajouter(produit, quantite)} disabled={!enStock} className="btn btn-plein min-w-[220px] flex-1 disabled:opacity-40">
          {enStock ? 'Ajouter au panier' : 'Épuisé'}
        </button>
      </div>
      <a href={lienWhatsApp(messageConseilProduit(produit.name))} target="_blank" rel="noopener noreferrer" className="btn btn-contour mt-3">
        <IconeWhatsApp width={16} height={16} />
        Demander conseil
      </a>
      <p className="label mt-6 text-cuivre">
        {enStock ? `En stock · ${produit.stock} pièce${produit.stock > 1 ? 's' : ''} disponible${produit.stock > 1 ? 's' : ''}` : 'Rupture de stock'}
      </p>
    </div>
  )
}

// Fiche produit : même langage « fiche technique », en plus grand
export default function FicheProduit() {
  const { slug } = useParams()
  const produit = useSelector(selectProduitParSlug(slug))
  const produits = useSelector(selectProduits)
  const refPage = useRef(null)
  useRevelations(refPage)

  if (!produit) return <PageIntrouvable />

  const similaires = produits.filter((autre) => autre.category === produit.category && autre._id !== produit._id).slice(0, 2)
  const conseils = CONSEILS_ENTRETIEN[produit.category] ?? CONSEILS_PAR_DEFAUT

  return (
    <div ref={refPage} className="pt-entete">
      <section className="grid grid-cols-1 border-b border-sable lg:grid-cols-2">
        <Galerie produit={produit} />
        <InfosProduit produit={produit} />
      </section>

      <section className="grid grid-cols-1 border-b border-sable md:grid-cols-2">
        <div className="bg-brun px-gouttiere py-16 text-creme lg:py-24">
          <p className="label text-ambre">Fait main au Maroc</p>
          <h2 data-reveal className="mt-6 text-sous-titre">Façonné par {produit.artisan}</h2>
          <p data-reveal className="mt-6 max-w-md text-sable">
            Cette pièce est réalisée entièrement à la main, sans chaîne de production. De légères variations de teinte ou de forme sont la signature de l'artisan, jamais un défaut.
          </p>
          <Link to="/artisans" className="btn btn-clair mt-10">Rencontrer nos artisans</Link>
        </div>
        <div className="px-gouttiere py-16 lg:py-24">
          <p className="label text-cuivre">Entretien</p>
          <h2 data-reveal className="mt-6 text-sous-titre">Pour la garder longtemps</h2>
          <ul className="liste-etoiles mt-8 space-y-3 text-brun/80">
            {conseils.map((conseil) => (
              <li key={conseil}>{conseil}</li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="titre-avis" className="px-gouttiere py-16 lg:py-24">
        <p className="label text-cuivre">Avis clients · {produit.numReviews}</p>
        <h2 id="titre-avis" data-reveal className="mb-10 mt-6 text-sous-titre">Ce qu'ils en disent</h2>
        <AvisProduit produit={produit} />
      </section>

      {similaires.length > 0 && (
        <>
          <SeparateurEtoile />
          <section aria-labelledby="titre-similaires" className="px-gouttiere py-16 lg:py-24">
            <h2 id="titre-similaires" data-reveal className="mb-10 text-sous-titre">Produits similaires</h2>
            <GrilleProduits produits={similaires} />
          </section>
        </>
      )}
    </div>
  )
}
