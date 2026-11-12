import { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { ListeArticles, Totaux } from '../components/cart/Recapitulatif'
import { Champ } from '../components/ui/Formulaire'
import { IconeCadenas } from '../components/ui/Icones'
import { EnTetePage } from '../components/ui/Page'
import { useFormulaire } from '../hooks/useFormulaire'
import { useToast } from '../hooks/useToast'
import { messageErreur } from '../services/api'
import { selectUtilisateur } from '../store/slices/authSlice'
import { selectArticles, viderPanier } from '../store/slices/cartSlice'
import { passerCommande } from '../store/slices/ordersSlice'
import { calculerTotaux } from '../utils/commande'
import { validerAdresse } from '../utils/validation'

const PREFIXE_ADRESSE = 'shippingAddress.'

// L'API nomme les champs « shippingAddress.phone » : on retire le préfixe pour le formulaire
const erreursAdresse = (champs) =>
  Object.fromEntries(
    Object.entries(champs)
      .filter(([cle]) => cle.startsWith(PREFIXE_ADRESSE))
      .map(([cle, message]) => [cle.slice(PREFIXE_ADRESSE.length), message]),
  )

// Checkout : adresse de livraison, récapitulatif, puis paiement Stripe Checkout (mode test).
// La commande est créée par l'API, qui recalcule les prix ; le webhook Stripe la marque payée.
export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const utilisateur = useSelector(selectUtilisateur)
  const articles = useSelector(selectArticles)
  // Référence (et non état) : elle doit être à jour dès le rendu provoqué par le vidage du panier
  const commandeEnvoyee = useRef(false)
  const [paiementEnCours, setPaiementEnCours] = useState(false)

  const payer = async (adresse) => {
    setPaiementEnCours(true)
    try {
      const items = articles.map((article) => ({ product: article.product, qty: article.qty }))
      const { commande, url, simule } = await dispatch(passerCommande({ items, shippingAddress: adresse })).unwrap()
      commandeEnvoyee.current = true
      if (!simule) {
        // Redirection vers la page de paiement Stripe ; le panier est vidé au retour
        window.location.assign(url)
        return
      }
      dispatch(viderPanier())
      toast('Paiement simulé (aucune clé Stripe configurée). Merci pour votre commande !')
      navigate(`/confirmation/${commande._id}`, { replace: true })
    } catch (erreur) {
      setErreurs(erreur.champs ? erreursAdresse(erreur.champs) : {})
      toast(messageErreur(erreur), 'erreur')
      setPaiementEnCours(false)
    }
  }

  const { champ, soumettre, setErreurs } = useFormulaire(
    { fullName: utilisateur?.name ?? '', phone: '', address: '', city: '', postalCode: '' },
    validerAdresse,
    payer,
  )

  // Panier vide : rien à payer (sauf juste après la validation, le temps de la redirection)
  if (articles.length === 0 && !commandeEnvoyee.current) return <Navigate to="/panier" replace />

  return (
    <>
      <EnTetePage label="Commande · étape 02 / 03" titre="Livraison et paiement" compact />

      <form onSubmit={soumettre} noValidate className="grid gap-12 px-gouttiere py-12 lg:grid-cols-[1fr_440px] lg:py-16">
        <fieldset disabled={paiementEnCours} className="grid h-fit gap-5 sm:grid-cols-2">
          <legend className="label mb-6 text-cuivre">Adresse de livraison</legend>
          <Champ label="Nom complet" autoComplete="name" className="sm:col-span-2" {...champ('fullName')} />
          <Champ label="Téléphone" type="tel" autoComplete="tel" placeholder="0612345678" className="sm:col-span-2" {...champ('phone')} />
          <Champ label="Adresse" autoComplete="street-address" className="sm:col-span-2" {...champ('address')} />
          <Champ label="Ville" autoComplete="address-level2" {...champ('city')} />
          <Champ label="Code postal" inputMode="numeric" autoComplete="postal-code" {...champ('postalCode')} />
        </fieldset>

        <aside className="h-fit border border-sable bg-beige p-6 xl:p-8">
          <p className="label text-cuivre">Récapitulatif</p>
          <div className="mt-2">
            <ListeArticles articles={articles} />
          </div>
          <div className="mt-6">
            <Totaux {...calculerTotaux(articles)} />
          </div>
          <button type="submit" disabled={paiementEnCours} className="btn btn-plein mt-8 w-full disabled:opacity-60">
            <IconeCadenas width={15} height={15} />
            {paiementEnCours ? 'Paiement en cours…' : 'Payer avec Stripe'}
          </button>
          <p className="mt-4 text-center text-[13px] text-cuivre">
            Paiement sécurisé par Stripe, en mode test : aucun débit réel.
          </p>
        </aside>
      </form>
    </>
  )
}
