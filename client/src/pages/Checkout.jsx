import { useState } from 'react'
import { nanoid } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { ListeArticles, Totaux } from '../components/cart/Recapitulatif'
import { Champ } from '../components/ui/Formulaire'
import { IconeCadenas } from '../components/ui/Icones'
import { EnTetePage } from '../components/ui/Page'
import { useFormulaire } from '../hooks/useFormulaire'
import { useToast } from '../hooks/useToast'
import { selectUtilisateur } from '../store/slices/authSlice'
import { selectArticles, viderPanier } from '../store/slices/cartSlice'
import { ajouterCommande } from '../store/slices/ordersSlice'
import { calculerTotaux, creerCommande } from '../utils/commande'
import { validerAdresse } from '../utils/validation'

const DELAI_PAIEMENT_SIMULE_MS = 900

// Checkout : adresse de livraison, récapitulatif, puis paiement.
// Phase 1 : le paiement est simulé. Phase 2 : Stripe Checkout Session (mode test) + webhook.
export default function Checkout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const toast = useToast()
  const utilisateur = useSelector(selectUtilisateur)
  const articles = useSelector(selectArticles)
  const [commandeEnvoyee, setCommandeEnvoyee] = useState(null)
  const [paiementEnCours, setPaiementEnCours] = useState(false)

  const payer = (adresse) => {
    setPaiementEnCours(true)
    window.setTimeout(() => {
      const commande = creerCommande({ id: `cmd-${nanoid(8)}`, articles, adresse, utilisateur })
      dispatch(ajouterCommande(commande))
      setCommandeEnvoyee(commande._id)
      dispatch(viderPanier())
      toast('Paiement accepté. Merci pour votre commande !')
      navigate(`/confirmation/${commande._id}`, { replace: true })
    }, DELAI_PAIEMENT_SIMULE_MS)
  }

  const { champ, soumettre } = useFormulaire(
    { fullName: utilisateur?.name ?? '', phone: '', address: '', city: '', postalCode: '' },
    validerAdresse,
    payer,
  )

  // Panier vide : rien à payer (sauf juste après la validation, le temps de la redirection)
  if (articles.length === 0 && !commandeEnvoyee) return <Navigate to="/panier" replace />

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
            Mode test : aucun débit réel. Le paiement est simulé en Phase 1.
          </p>
        </aside>
      </form>
    </>
  )
}
