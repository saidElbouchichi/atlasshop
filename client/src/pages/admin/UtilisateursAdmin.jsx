import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../../hooks/useToast'
import { messageErreur } from '../../services/api'
import { modifierRole as modifierRoleApi, selectUtilisateur, selectUtilisateurs } from '../../store/slices/authSlice'
import { idClient, selectCommandes } from '../../store/slices/ordersSlice'
import { formaterDate } from '../../utils/commande'

// Liste des utilisateurs avec gestion du rôle (on ne peut pas retirer son propre rôle admin)
export default function UtilisateursAdmin() {
  const dispatch = useDispatch()
  const toast = useToast()
  const utilisateurs = useSelector(selectUtilisateurs)
  const moi = useSelector(selectUtilisateur)
  const commandes = useSelector(selectCommandes)

  const nombreCommandes = (id) => commandes.filter((commande) => idClient(commande) === id).length

  const modifierRole = async (utilisateur, role) => {
    try {
      await dispatch(modifierRoleApi({ id: utilisateur._id, role })).unwrap()
      toast(`${utilisateur.name} est maintenant ${role === 'admin' ? 'administrateur' : 'client'}.`)
    } catch (erreur) {
      toast(messageErreur(erreur), 'erreur')
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-[24px] tracking-[-0.02em]">Utilisateurs · {utilisateurs.length}</h2>
      <div className="overflow-x-auto">
        <table className="tableau min-w-[640px]">
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">E-mail</th>
              <th scope="col">Inscrit le</th>
              <th scope="col">Commandes</th>
              <th scope="col">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((utilisateur) => (
              <tr key={utilisateur._id}>
                <td className="font-medium">{utilisateur.name}</td>
                <td>{utilisateur.email}</td>
                <td className="whitespace-nowrap">{formaterDate(utilisateur.createdAt)}</td>
                <td className="tabular-nums">{nombreCommandes(utilisateur._id)}</td>
                <td>
                  <select
                    aria-label={`Rôle de ${utilisateur.name}`}
                    value={utilisateur.role}
                    disabled={utilisateur._id === moi?._id}
                    onChange={(evenement) => modifierRole(utilisateur, evenement.target.value)}
                    className="champ-compact disabled:opacity-50"
                  >
                    <option value="user">Client</option>
                    <option value="admin">Administrateur</option>
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
