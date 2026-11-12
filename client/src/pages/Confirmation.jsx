import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ListeArticles, Totaux } from '../components/cart/Recapitulatif'
import Etoile, { Chargeur } from '../components/ui/Etoile'
import { EnTetePage } from '../components/ui/Page'
import { viderPanier } from '../store/slices/cartSlice'
import { chargerCommande, selectCommandeParId } from '../store/slices/ordersSlice'
import { formaterDate } from '../utils/commande'
import PageIntrouvable from './PageIntrouvable'

const DELAI_WEBHOOK_MS = 3000

// Confirmation de commande (visible par son propriétaire ou un admin)
export default function Confirmation() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const [parametres] = useSearchParams()
  const commande = useSelector(selectCommandeParId(id))
  const [etat, setEtat] = useState('chargement')
  const retourDeStripe = parametres.get('paiement') === 'succes'

  useEffect(() => {
    let annule = false
    const charger = () =>
      dispatch(chargerCommande(id))
        .unwrap()
        .then(() => !annule && setEtat('pret'))
        .catch(() => !annule && setEtat('introuvable'))

    charger()
    if (!retourDeStripe) return () => { annule = true }

    // Retour de Stripe : le panier est soldé, et on relit la commande une fois le webhook passé
    dispatch(viderPanier())
    const minuterie = window.setTimeout(charger, DELAI_WEBHOOK_MS)
    return () => {
      annule = true
      window.clearTimeout(minuterie)
    }
  }, [dispatch, id, retourDeStripe])

  if (etat === 'chargement' && !commande) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center pt-entete">
        <Chargeur texte="Chargement de la commande…" />
      </div>
    )
  }
  if (!commande) return <PageIntrouvable />

  const { shippingAddress: adresse } = commande

  return (
    <>
      <EnTetePage label="Commande · étape 03 / 03" titre={commande.isPaid ? 'Merci, votre commande est confirmée.' : 'Commande enregistrée, paiement en attente.'}>
        {commande.isPaid
          ? 'Un artisan prépare déjà votre colis. Vous recevrez un message dès son expédition.'
          : 'Nous attendons la confirmation de votre paiement. Cette page se met à jour dès sa réception.'}
      </EnTetePage>

      <section className="grid gap-12 px-gouttiere py-12 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="label flex items-center gap-3 text-ambre">
            <Etoile className="h-4 w-4" />
            Commande #{commande._id.slice(-6).toUpperCase()}
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
