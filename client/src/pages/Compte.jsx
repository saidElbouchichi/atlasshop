import { nanoid } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { FiligraneEtoile } from '../components/ui/Etoile'
import { Champ } from '../components/ui/Formulaire'
import { useFormulaire } from '../hooks/useFormulaire'
import { useToast } from '../hooks/useToast'
import { connecter, inscrire, selectUtilisateur, selectUtilisateurs, trouverParEmail } from '../store/slices/authSlice'
import { validerConnexion, validerInscription } from '../utils/validation'

// N'accepte qu'un chemin interne comme redirection (évite les redirections ouvertes)
function cheminSur(redirection) {
  return redirection && redirection.startsWith('/') && !redirection.startsWith('//') ? redirection : '/profil'
}

function FormulaireConnexion({ surSucces }) {
  const dispatch = useDispatch()
  const utilisateurs = useSelector(selectUtilisateurs)

  const { champ, soumettre, setErreurs } = useFormulaire({ email: '', password: '' }, validerConnexion, ({ email }) => {
    const utilisateur = trouverParEmail(utilisateurs, email)
    if (!utilisateur) {
      setErreurs({ email: 'Aucun compte ne correspond à cet e-mail.' })
      return
    }
    dispatch(connecter(utilisateur))
    surSucces(`Heureux de vous revoir, ${utilisateur.name.split(' ')[0]}.`)
  })

  return (
    <form onSubmit={soumettre} noValidate className="grid gap-5">
      <Champ label="E-mail" type="email" autoComplete="email" {...champ('email')} />
      <Champ label="Mot de passe" type="password" autoComplete="current-password" {...champ('password')} />
      <button type="submit" className="btn btn-plein mt-2">Se connecter</button>
    </form>
  )
}

function FormulaireInscription({ surSucces }) {
  const dispatch = useDispatch()
  const utilisateurs = useSelector(selectUtilisateurs)

  const { champ, soumettre, setErreurs } = useFormulaire(
    { name: '', email: '', password: '', confirmation: '' },
    validerInscription,
    ({ name, email }) => {
      if (trouverParEmail(utilisateurs, email)) {
        setErreurs({ email: 'Un compte existe déjà avec cet e-mail.' })
        return
      }
      const utilisateur = {
        _id: `u-${nanoid(6)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'user',
        createdAt: new Date().toISOString().slice(0, 10),
      }
      dispatch(inscrire(utilisateur))
      surSucces(`Bienvenue chez AtlasShop, ${utilisateur.name.split(' ')[0]}.`)
    },
  )

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

          {!estInscription && (
            <div className="mt-10 border border-sable bg-beige p-5 text-[13px] text-brun/80">
              <p className="label mb-2 text-cuivre">Comptes de démo · Phase 1</p>
              <p>Admin : admin@atlasshop.ma — Client : salma@atlasshop.ma</p>
              <p className="mt-1">L'authentification est simulée : n'importe quel mot de passe de 6 caractères est accepté.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
