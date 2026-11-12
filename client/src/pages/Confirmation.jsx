import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { ListeArticles, Totaux } from '../components/cart/Recapitulatif'
import Etoile from '../components/ui/Etoile'
import { EnTetePage } from '../components/ui/Page'
import { selectUtilisateur } from '../store/slices/authSlice'
import { selectCommandeParId } from '../store/slices/ordersSlice'
import { formaterDate } from '../utils/commande'
import PageIntrouvable from './PageIntrouvable'

// Confirmation de commande (visible par son propriétaire ou un admin)
export default function Confirmation() {
  const { id } = useParams()
  const commande = useSelector(selectCommandeParId(id))
  const utilisateur = useSelector(selectUtilisateur)
  const autorise = commande && (commande.user._id === utilisateur?._id || utilisateur?.role === 'admin')

  if (!autorise) return <PageIntrouvable />

  const { shippingAddress: adresse } = commande

  return (
    <>
      <EnTetePage label="Commande · étape 03 / 03" titre="Merci, votre commande est confirmée.">
        Un artisan prépare déjà votre colis. Vous recevrez un message dès son expédition.
      </EnTetePage>

      <section className="grid gap-12 px-gouttiere py-12 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="label flex items-center gap-3 text-ambre">
            <Etoile className="h-4 w-4" />
            Commande {commande._id}
          </p>
          <dl className="mt-8 border-t border-sable">
            {[
              ['Date', formaterDate(commande.createdAt)],
              ['Statut', commande.status],
              ['Paiement', commande.isPaid ? `Payée le ${formaterDate(commande.paidAt)}` : 'En attente'],
              ['Livraison', `${adresse.fullName}, ${adresse.address}, ${adresse.postalCode} ${adresse.city}`],
              ['Téléphone', adresse.phone],
            ].map(([label, valeur]) => (
              <div key={label} className="flex items-baseline justify-between gap-6 border-b border-sable py-3">
                <dt className="text-mini uppercase text-cuivre">{label}</dt>
                <dd className="text-right text-[14px] first-letter:uppercase">{valeur}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/profil" className="btn btn-plein">Suivre mes commandes</Link>
            <Link to="/catalogue" className="btn btn-contour">Continuer mes achats</Link>
          </div>
        </div>

        <aside className="h-fit border border-sable bg-beige p-6 xl:p-8">
          <p className="label text-cuivre">Votre commande</p>
          <div className="mt-2">
            <ListeArticles articles={commande.items} />
          </div>
          <div className="mt-6">
            <Totaux itemsPrice={commande.itemsPrice} shippingPrice={commande.shippingPrice} totalPrice={commande.totalPrice} />
          </div>
        </aside>
      </section>
    </>
  )
}
