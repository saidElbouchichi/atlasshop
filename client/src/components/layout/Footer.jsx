import { Link } from 'react-router-dom'
import { categories } from '../../data/categories'
import { lienWhatsApp } from '../../utils/whatsapp'

const ANNEE = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-creme/15 bg-brun text-creme">
      <div className="grid gap-12 px-gouttiere py-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="label text-ambre">AtlasShop</p>
          <p className="mt-6 max-w-md text-sous-titre">
            L'artisanat marocain, de l'atelier à votre maison.
          </p>
        </div>

        <nav aria-label="Catégories" className="md:col-span-3">
          <p className="label text-taupe">Collection</p>
          <ul className="mt-6 space-y-2">
            {categories.map((categorie) => (
              <li key={categorie._id}>
                <Link
                  to={`/catalogue?category=${categorie.slug}`}
                  className="transition-colors duration-300 hover:text-ambre"
                >
                  {categorie.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Maison" className="md:col-span-3">
          <p className="label text-taupe">Maison</p>
          <ul className="mt-6 space-y-2">
            <li>
              <Link to="/artisans" className="transition-colors duration-300 hover:text-ambre">
                Nos artisans
              </Link>
            </li>
            <li>
              <Link to="/connexion" className="transition-colors duration-300 hover:text-ambre">
                Mon compte
              </Link>
            </li>
            <li>
              <a
                href={lienWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-ambre"
              >
                Demander conseil sur WhatsApp
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="flex flex-col gap-2 border-t border-creme/15 px-gouttiere py-6 sm:flex-row sm:justify-between">
        <p className="label text-taupe">© {ANNEE} AtlasShop — Projet final GOMYCODE</p>
        <p className="label text-taupe">Fait main au Maroc</p>
      </div>
    </footer>
  )
}
