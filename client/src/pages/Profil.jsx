import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { EnTetePage } from '../components/ui/Page'
import { useToast } from '../hooks/useToast'
import { deconnecter, selectUtilisateur } from '../store/slices/authSlice'
import { selectCommandes } from '../store/slices/ordersSlice'
import { formaterDate } from '../utils/commande'
import { formaterPrix } from '../utils/format'

export function BadgeStatut({ statut }) {
  const couleur = statut === 'annulée' ? 'border-sable text-cuivre' : statut === 'en attente' ? 'border-ambre text-cuivre' : 'border-brun bg-brun text-creme'
  return <span className={`inline-block rounded border px-2 py-1 text-mini font-medium uppercase ${couleur}`}>{statut}</span>
}

// Profil : informations du compte et historique des commandes
export default function Profil() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const utilisateur = useSelector(selectUtilisateur)
  const commandes = useSelector(selectCommandes).filter((commande) => commande.user._id === utilisateur._id)

  const seDeconnecter = () => {
    dispatch(deconnecter())
    toast('Vous êtes déconnecté. À bientôt !', 'info')
    navigate('/', { replace: true })
  }

  return (
    <>
      <EnTetePage label="Mon compte" titre={`Bonjour, ${utilisateur.name.split(' ')[0]}.`} />

      <section className="grid gap-12 px-gouttiere py-12 lg:grid-cols-[360px_1fr] lg:py-16">
        <aside className="h-fit border border-sable bg-beige p-6 xl:p-8">
          <p className="label text-cuivre">Mes informations</p>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-mini uppercase text-cuivre">Nom</dt>
              <dd>{utilisateur.name}</dd>
            </div>
            <div>
              <dt className="text-mini uppercase text-cuivre">E-mail</dt>
              <dd className="break-all">{utilisateur.email}</dd>
            </div>
            <div>
              <dt className="text-mini uppercase text-cuivre">Rôle</dt>
              <dd>{utilisateur.role === 'admin' ? 'Administrateur' : 'Client'}</dd>
            </div>
          </dl>
          {utilisateur.role === 'admin' && <Link to="/admin" className="btn btn-plein mt-8 w-full">Ouvrir l'administration</Link>}
          <button type="button" onClick={seDeconnecter} className="btn btn-contour mt-3 w-full">Se déconnecter</button>
        </aside>

        <div>
          <p className="label text-cuivre">Historique des commandes · {commandes.length}</p>
          {commandes.length === 0 ? (
            <div className="mt-6 border border-sable px-6 py-14 text-center">
              <p className="text-sous-titre">Aucune commande pour l'instant.</p>
              <Link to="/catalogue" className="btn btn-plein mt-8">Découvrir la collection</Link>
            </div>
          ) : (
            <ul className="mt-6 border-t border-sable">
              {commandes.map((commande) => (
                <li key={commande._id} className="grid gap-3 border-b border-sable py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
                  <div>
                    <p className="label">{commande._id}</p>
                    <p className="mt-1 text-[13px] text-cuivre">
                      {formaterDate(commande.createdAt)} · {commande.items.map((article) => `${article.qty} × ${article.name}`).join(', ')}
                    </p>
                  </div>
                  <BadgeStatut statut={commande.status} />
                  <div className="flex items-center gap-6 sm:justify-end">
                    <span className="tabular-nums text-ambre">{formaterPrix(commande.totalPrice)}</span>
                    <Link to={`/confirmation/${commande._id}`} className="lien-ambre">Détail</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
