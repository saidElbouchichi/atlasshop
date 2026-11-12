import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { NavLink, Route, Routes } from 'react-router-dom'
import { EnTetePage } from '../../components/ui/Page'
import { chargerUtilisateurs } from '../../store/slices/authSlice'
import { chargerCommandes } from '../../store/slices/ordersSlice'
import { chargerProduits } from '../../store/slices/productsSlice'
import PageIntrouvable from '../PageIntrouvable'
import CategoriesAdmin from './CategoriesAdmin'
import CommandesAdmin from './CommandesAdmin'
import ProduitsAdmin from './ProduitsAdmin'
import TableauDeBord from './TableauDeBord'
import UtilisateursAdmin from './UtilisateursAdmin'

const ONGLETS = [
  { vers: '/admin', texte: 'Tableau de bord', exact: true },
  { vers: '/admin/produits', texte: 'Produits' },
  { vers: '/admin/categories', texte: 'Catégories' },
  { vers: '/admin/commandes', texte: 'Commandes' },
  { vers: '/admin/utilisateurs', texte: 'Utilisateurs' },
]

// Administration : design sobre dans le même thème, navigation par onglets
export default function Admin() {
  const dispatch = useDispatch()

  // À l'ouverture de l'admin : données fraîches (commandes, utilisateurs, stocks)
  useEffect(() => {
    dispatch(chargerCommandes())
    dispatch(chargerUtilisateurs())
    dispatch(chargerProduits())
  }, [dispatch])

  return (
    <>
      <EnTetePage label="Administration" titre="Gestion de la boutique" compact />

      <nav aria-label="Sections de l'administration" className="sticky top-14 z-20 overflow-x-auto border-b border-sable bg-creme/95 px-gouttiere backdrop-blur">
        <ul className="flex gap-1">
          {ONGLETS.map((onglet) => (
            <li key={onglet.vers}>
              <NavLink
                to={onglet.vers}
                end={onglet.exact}
                className={({ isActive }) =>
                  `label block whitespace-nowrap border-b-2 px-4 py-4 transition-colors duration-300 ${
                    isActive ? 'border-ambre text-brun' : 'border-transparent text-cuivre hover:text-brun'
                  }`
                }
              >
                {onglet.texte}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <section className="min-h-[60svh] px-gouttiere py-10 lg:py-14">
        <Routes>
          <Route index element={<TableauDeBord />} />
          <Route path="produits" element={<ProduitsAdmin />} />
          <Route path="categories" element={<CategoriesAdmin />} />
          <Route path="commandes" element={<CommandesAdmin />} />
          <Route path="utilisateurs" element={<UtilisateursAdmin />} />
          <Route path="*" element={<PageIntrouvable />} />
        </Routes>
      </section>
    </>
  )
}
