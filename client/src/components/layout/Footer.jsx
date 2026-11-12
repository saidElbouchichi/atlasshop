import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectCategories } from '../../store/slices/categoriesSlice'
import { lienWhatsApp } from '../../utils/whatsapp'
import Etoile, { FiligraneEtoile } from '../ui/Etoile'
import { IconeFacebook, IconeInstagram, IconeTikTok, IconeWhatsApp } from '../ui/Icones'

const ANNEE = new Date().getFullYear()

// Comptes à remplacer par ceux de la boutique
const RESEAUX = [
  { nom: 'Instagram', lien: 'https://www.instagram.com/', Icone: IconeInstagram },
  { nom: 'Facebook', lien: 'https://www.facebook.com/', Icone: IconeFacebook },
  { nom: 'TikTok', lien: 'https://www.tiktok.com/', Icone: IconeTikTok },
]

const LIENS_MAISON = [
  { vers: '/catalogue', texte: 'Catalogue' },
  { vers: '/artisans', texte: 'Nos artisans' },
  { vers: '/connexion', texte: 'Mon compte' },
  { vers: '/panier', texte: 'Panier' },
]

const classeLien = 'transition-colors duration-300 hover:text-ambre'

// Footer sombre : grand logo clair, liens, réseaux sociaux et rappel « Fait main au Maroc »
export default function Footer() {
  const categories = useSelector(selectCategories)
  return (
    <footer className="relative overflow-hidden bg-brun text-creme">
      <FiligraneEtoile className="-bottom-40 -right-40 h-[640px] w-[640px]" />

      <div className="relative grid gap-12 px-gouttiere py-16 md:grid-cols-12 lg:py-20">
        <div className="md:col-span-6">
          <img
            src="/logo-clair.webp"
            alt="AtlasShop"
            width="282"
            height="180"
            loading="lazy"
            className="h-[120px] w-auto sm:h-[180px]"
          />
          <p className="mt-8 max-w-md text-sous-titre">L'artisanat marocain, chez vous.</p>
          <p className="label mt-6 flex items-center gap-3 text-ambre">
            <Etoile className="h-4 w-4" />
            Fait main au Maroc
          </p>
        </div>

        <nav aria-label="Catégories" className="md:col-span-3">
          <p className="label text-dune">Collection</p>
          <ul className="liste-etoiles mt-6 space-y-2">
            {categories.map((categorie) => (
              <li key={categorie._id}>
                <Link to={`/catalogue?category=${categorie.slug}`} className={classeLien}>
                  {categorie.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Maison" className="md:col-span-3">
          <p className="label text-dune">Maison</p>
          <ul className="liste-etoiles mt-6 space-y-2">
            {LIENS_MAISON.map((lien) => (
              <li key={lien.vers}>
                <Link to={lien.vers} className={classeLien}>
                  {lien.texte}
                </Link>
              </li>
            ))}
          </ul>

          <p className="label mt-10 text-dune">Nous suivre</p>
          <ul className="mt-5 flex gap-2">
            <li>
              <a
                href={lienWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="case-icone border-creme/40 hover:text-brun"
              >
                <IconeWhatsApp />
              </a>
            </li>
            {RESEAUX.map(({ nom, lien, Icone }) => (
              <li key={nom}>
                <a
                  href={lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={nom}
                  className="case-icone border-creme/40 hover:text-brun"
                >
                  <Icone />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="relative flex flex-col gap-2 border-t border-creme/15 px-gouttiere py-6 sm:flex-row sm:justify-between">
        <p className="label text-dune">© {ANNEE} AtlasShop — Projet final GOMYCODE</p>
        <p className="label text-dune">Livraison partout au Maroc · Paiement sécurisé</p>
      </div>
    </footer>
  )
}
