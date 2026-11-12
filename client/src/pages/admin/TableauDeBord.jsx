import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Compteur from '../../components/ui/Compteur'
import { selectUtilisateurs } from '../../store/slices/authSlice'
import { selectCommandes } from '../../store/slices/ordersSlice'
import { selectProduits } from '../../store/slices/productsSlice'
import { chiffreAffaires, formaterDate } from '../../utils/commande'
import { formaterPrix } from '../../utils/format'
import { BadgeStatut } from '../Profil'

const SEUIL_STOCK_BAS = 5
const NOMBRE_COMMANDES_RECENTES = 5

// Tableau de bord : indicateurs clés, dernières commandes et stocks bas
export default function TableauDeBord() {
  const commandes = useSelector(selectCommandes)
  const produits = useSelector(selectProduits)
  const utilisateurs = useSelector(selectUtilisateurs)
  const stocksBas = produits.filter((produit) => produit.stock <= SEUIL_STOCK_BAS)

  const indicateurs = [
    { texte: "Chiffre d'affaires", valeur: chiffreAffaires(commandes), suffixe: ' MAD' },
    { texte: 'Commandes', valeur: commandes.length },
    { texte: 'Produits', valeur: produits.length },
    { texte: 'Clients', valeur: utilisateurs.filter((utilisateur) => utilisateur.role === 'user').length },
  ]

  return (
    <div className="space-y-14">
      <dl className="grid grid-cols-2 gap-px border border-sable bg-sable lg:grid-cols-4">
        {indicateurs.map((indicateur) => (
          <div key={indicateur.texte} className="bg-beige p-6">
            <dt className="label text-cuivre">{indicateur.texte}</dt>
            <dd className="mt-4 text-[clamp(26px,3vw,44px)] leading-none tracking-[-0.03em]">
              <Compteur valeur={indicateur.valeur} suffixe={indicateur.suffixe} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="flex items-end justify-between">
            <h2 className="text-[24px] tracking-[-0.02em]">Dernières commandes</h2>
            <Link to="/admin/commandes" className="lien-ambre">Tout voir</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="tableau min-w-[520px]">
              <thead>
                <tr>
                  <th scope="col">Commande</th>
                  <th scope="col">Client</th>
                  <th scope="col">Date</th>
                  <th scope="col">Statut</th>
                  <th scope="col" className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {commandes.slice(0, NOMBRE_COMMANDES_RECENTES).map((commande) => (
                  <tr key={commande._id}>
                    <td className="font-medium">{commande._id}</td>
                    <td>{commande.user.name}</td>
                    <td className="whitespace-nowrap">{formaterDate(commande.createdAt)}</td>
                    <td><BadgeStatut statut={commande.status} /></td>
                    <td className="text-right tabular-nums">{formaterPrix(commande.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-[24px] tracking-[-0.02em]">Stocks bas</h2>
          <ul className="mt-4 border-t border-sable">
            {stocksBas.length === 0 && <li className="border-b border-sable py-3 text-brun/80">Tous les stocks sont confortables.</li>}
            {stocksBas.map((produit) => (
              <li key={produit._id} className="flex justify-between gap-4 border-b border-sable py-3">
                <span>{produit.name}</span>
                <span className="label text-cuivre">{produit.stock} restant{produit.stock > 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
