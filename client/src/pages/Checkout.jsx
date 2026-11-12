import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { ListeArticles, Totaux } from '../components/cart/Recapitulatif'
import { Champ } from '../components/ui/Formulaire'
import { IconeCadenas } from '../components/ui/Icones'
import { EnTetePage } from '../components/ui/Page'
import { useFormulaire } from '../hooks/useFormulaire'
import { useToast } from '../hooks/useToast'
import { messageErreur, requete } from '../services/api'
import { selectUtilisateur } from '../store/slices/authSlice'
import { selectArticles, viderPanier } from '../store/slices/cartSlice'
import { passerCommande } from '../store/slices/ordersSlice'
import { calculerTotaux } from '../utils/commande'
import { validerAdresse } from '../utils/validation'

const PREFIXE_ADRESSE = 'shippingAddress.'

const MOYENS = [
  { valeur: 'carte', titre: 'Carte bancaire', texte: 'Paiement sécurisé par Stripe.' },
  { valeur: 'livraison', titre: 'Paiement à la livraison', texte: 'Vous réglez en espèces à la réception du colis.' },
]

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
  // Moyens proposés par l'API : la carte n'est offerte que si Stripe est configuré
  const [carteDisponible, setCarteDisponible] = useState(false)
  const [moyen, setMoyen] = useState('livraison')

  useEffect(() => {
    let annule = false
    requete({ url: '/payments/methods' })
      .then(({ data }) => {
        if (annule || !data.carte) return
        setCarteDisponible(true)
        setMoyen('carte')
      })
      .catch(() => null) // en cas d'échec, le paiement à la livraison reste proposé
    return () => {
      annule = true
    }
  }, [])

  const payer = async (adresse) => {
    setPaiementEnCours(true)
    try {
      const items = articles.map((article) => ({ product: article.product, qty: article.qty }))
      const { commande, url, simule } = await dispatch(passerCommande({ items, shippingAddress: adresse, paymentMethod: moyen })).unwrap()
      commandeEnvoyee.current = true
      if (url && !simule) {
        // Redirection vers la page de paiement Stripe ; le panier est vidé au retour
        window.location.assign(url)
        return
      }
      dispatch(viderPanier())
      toast(moyen === 'livraison' ? 'Commande enregistrée. Vous réglerez à la livraison.' : 'Paiement simulé (aucune clé Stripe configurée). Merci pour votre commande !')
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
          <fieldset disabled={paiementEnCours} className="mt-8 border-t border-sable pt-6">
            <legend className="label text-cuivre">Moyen de paiement</legend>
            <div className="mt-3 grid gap-2">
              {MOYENS.filter((option) => option.valeur !== 'carte' || carteDisponible).map((option) => (
                <label
                  key={option.valeur}
                  className={`flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors duration-300 ${
                    moyen === option.valeur ? 'border-brun bg-creme' : 'border-sable hover:border-cuivre'
                  }`}
                >
                  <input
                    type="radio"
                    name="moyen-paiement"
                    value={option.valeur}
                    checked={moyen === option.valeur}
                    onChange={() => setMoyen(option.valeur)}
                    className="mt-1 accent-[#EC9226]"
                  />
                  <span>
                    <span className="label block">{option.titre}</span>
                    <span className="text-[13px] text-brun/80">{option.texte}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" disabled={paiementEnCours} className="btn btn-plein mt-6 w-full disabled:opacity-60">
            <IconeCadenas width={15} height={15} />
            {paiementEnCours ? 'Validation en cours…' : moyen === 'carte' ? 'Payer par carte' : 'Confirmer la commande'}
          </button>
          <p className="mt-4 text-center text-[13px] text-cuivre">
            {moyen === 'carte' ? 'Stripe en mode test : aucun débit réel.' : 'Aucun paiement en ligne : vous réglez au livreur.'}
          </p>
        </aside>
      </form>
    </>
  )
}
