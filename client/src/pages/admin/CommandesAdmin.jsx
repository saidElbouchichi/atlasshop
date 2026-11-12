import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useToast } from '../../hooks/useToast'
import { changerStatut, selectCommandes } from '../../store/slices/ordersSlice'
import { STATUTS_COMMANDE, formaterDate } from '../../utils/commande'
import { formaterPrix } from '../../utils/format'

// Liste des commandes avec changement de statut
export default function CommandesAdmin() {
  const dispatch = useDispatch()
  const toast = useToast()
  const commandes = useSelector(selectCommandes)

  const modifierStatut = (commande, status) => {
    dispatch(changerStatut({ id: commande._id, status }))
    toast(`Commande ${commande._id} : ${status}.`)
  }

  return (
    <div>
      <h2 className="mb-4 text-[24px] tracking-[-0.02em]">Commandes · {commandes.length}</h2>
      <div className="overflow-x-auto">
        <table className="tableau min-w-[820px]">
          <thead>
            <tr>
              <th scope="col">Commande</th>
              <th scope="col">Client</th>
              <th scope="col">Date</th>
              <th scope="col">Articles</th>
              <th scope="col">Total</th>
              <th scope="col">Payée</th>
              <th scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
            {commandes.map((commande) => (
              <tr key={commande._id}>
                <td>
                  <Link to={`/confirmation/${commande._id}`} className="font-medium underline-offset-4 hover:text-ambre hover:underline">{commande._id}</Link>
                </td>
                <td>
                  {commande.user.name}
                  <span className="block text-[12px] text-cuivre">{commande.shippingAddress.city}</span>
                </td>
                <td className="whitespace-nowrap">{formaterDate(commande.createdAt)}</td>
                <td className="tabular-nums">{commande.items.reduce((total, article) => total + article.qty, 0)}</td>
                <td className="whitespace-nowrap tabular-nums">{formaterPrix(commande.totalPrice)}</td>
                <td>{commande.isPaid ? 'Oui' : 'Non'}</td>
                <td>
                  <select
                    aria-label={`Statut de la commande ${commande._id}`}
                    value={commande.status}
                    onChange={(evenement) => modifierStatut(commande, evenement.target.value)}
                    className="champ-compact first-letter:uppercase"
                  >
                    {STATUTS_COMMANDE.map((statut) => (
                      <option key={statut} value={statut}>{statut}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
