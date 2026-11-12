import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { FiligraneEtoile } from '../components/ui/Etoile'
import { Champ } from '../components/ui/Formulaire'
import { useFormulaire } from '../hooks/useFormulaire'
import { useToast } from '../hooks/useToast'
import { connexion, inscription, selectUtilisateur } from '../store/slices/authSlice'
import { validerConnexion, validerInscription } from '../utils/validation'

// N'accepte qu'un chemin interne comme redirection (évite les redirections ouvertes)
function cheminSur(redirection) {
  return redirection && redirection.startsWith('/') && !redirection.startsWith('//') ? redirection : '/profil'
}

// Envoie le formulaire à l'API ; en cas de refus, affiche le détail par champ ou le message général
function useEnvoi(action, surSucces, messageDeBienvenue) {
  const dispatch = useDispatch()
  return (setErreurs) => async (valeurs) => {
    try {
      const utilisateur = await dispatch(action(valeurs)).unwrap()
      surSucces(messageDeBienvenue(utilisateur.name.split(' ')[0]))
    } catch (erreur) {
      setErreurs(erreur.champs ?? { email: erreur.message })
    }
  }
}

function FormulaireConnexion({ surSucces }) {
  const envoyer = useEnvoi(connexion, surSucces, (prenom) => `Heureux de vous revoir, ${prenom}.`)
  const formulaire = useFormulaire({ email: '', password: '' }, validerConnexion, (valeurs) => envoyer(formulaire.setErreurs)(valeurs))
  const { champ, soumettre } = formulaire

  return (
    <form onSubmit={soumettre} noValidate className="grid gap-5">
      <Champ label="E-mail" type="email" autoComplete="email" {...champ('email')} />
      <Champ label="Mot de passe" type="password" autoComplete="current-password" {...champ('password')} />
      <button type="submit" className="btn btn-plein mt-2">Se connecter</button>
    </form>
  )
}

function FormulaireInscription({ surSucces }) {
  const envoyer = useEnvoi(inscription, surSucces, (prenom) => `Bienvenue chez AtlasShop, ${prenom}.`)
  const formulaire = useFormulaire(
    { name: '', email: '', password: '', confirmation: '' },
    validerInscription,
    ({ name, email, password }) => envoyer(formulaire.setErreurs)({ name: name.trim(), email: email.trim(), password }),
  )
  const { champ, soumettre } = formulaire

  return (
    <form onSubmit={soumettre} noValidate className="grid gap-5">
      <Champ label="Nom complet" autoComplete="name" {...champ('name')} />
      <Champ label="E-mail" type="email" autoComplete="email" {...champ('email')} />
      <Champ label="Mot de passe" type="password" autoComplete="new-password" {...champ('password')} />
      <Champ label="Confirmer le mot de passe" type="password" autoComplete="new-password" {...champ('confirmation')} />
      <button type="submit" className="btn btn-plein mt-2">Créer mon compte</button>
    </form>
  )
}

// Connexion / Inscription sur une même page en deux colonnes
export default function Compte({ mode = 'connexion' }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [parametres] = useSearchParams()
  const utilisateur = useSelector(selectUtilisateur)
  const destination = cheminSur(parametres.get('redirect'))
  const estInscription = mode === 'inscription'
  const suffixe = parametres.get('redirect') ? `?redirect=${encodeURIComponent(destination)}` : ''

  const surSucces = (message) => {
    toast(message)
    navigate(destination, { replace: true })
  }

  if (utilisateur) return <Navigate to={destination} replace />

  return (
    <section className="grid min-h-[100svh] grid-cols-1 pt-entete lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brun p-gouttiere text-creme lg:flex lg:flex-col lg:justify-between">
        <FiligraneEtoile className="-bottom-40 -left-40 h-[640px] w-[640px]" />
        <p className="label relative text-ambre">Espace client</p>
        <div className="relative">
          <p className="text-titre">Votre atelier personnel.</p>
          <ul className="liste-etoiles mt-10 space-y-3 text-sable">
            <li>Suivez vos commandes pas à pas</li>
            <li>Retrouvez vos adresses de livraison</li>
            <li>Partagez votre avis sur chaque pièce</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col justify-center px-gouttiere py-16">
        <div className="w-full max-w-md">
          <p className="label text-cuivre">{estInscription ? 'Inscription' : 'Connexion'}</p>
          <h1 className="mb-10 mt-6 text-sous-titre">{estInscription ? 'Créer un compte' : 'Heureux de vous revoir'}</h1>

          {estInscription ? <FormulaireInscription surSucces={surSucces} /> : <FormulaireConnexion surSucces={surSucces} />}

          <p className="mt-8 text-brun/80">
            {estInscription ? 'Déjà client ? ' : 'Pas encore de compte ? '}
            <Link to={`${estInscription ? '/connexion' : '/inscription'}${suffixe}`} className="lien-ambre">
              {estInscription ? 'Se connecter' : 'Créer un compte'}
            </Link>
          </p>

        </div>
      </div>
    </section>
  )
}
