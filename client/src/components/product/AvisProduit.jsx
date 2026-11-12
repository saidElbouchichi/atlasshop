import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useFormulaire } from '../../hooks/useFormulaire'
import { useToast } from '../../hooks/useToast'
import { selectUtilisateur } from '../../store/slices/authSlice'
import { ajouterAvis } from '../../store/slices/productsSlice'
import { validerAvis } from '../../utils/validation'
import { Champ, Note } from '../ui/Formulaire'

const NOTES = [5, 4, 3, 2, 1]

function FormulaireAvis({ produit, utilisateur }) {
  const dispatch = useDispatch()
  const toast = useToast()

  const publier = ({ rating, comment }) => {
    const avis = { user: utilisateur._id, name: utilisateur.name, rating: Number(rating), comment: comment.trim() }
    dispatch(ajouterAvis({ productId: produit._id, avis }))
    toast('Merci, votre avis est publié.')
  }

  const { champ, soumettre } = useFormulaire({ rating: '5', comment: '' }, validerAvis, publier)

  return (
    <form onSubmit={soumettre} noValidate className="grid gap-4">
      <Champ label="Votre note" as="select" {...champ('rating')}>
        {NOTES.map((note) => (
          <option key={note} value={note}>
            {note} / 5
          </option>
        ))}
      </Champ>
      <Champ label="Votre avis" as="textarea" maxLength={600} {...champ('comment')} />
      <button type="submit" className="btn btn-plein w-fit">
        Publier mon avis
      </button>
    </form>
  )
}

// Avis clients d'un produit : liste + formulaire (connecté, un seul avis par produit)
export default function AvisProduit({ produit }) {
  const utilisateur = useSelector(selectUtilisateur)
  const dejaDonne = Boolean(utilisateur && produit.reviews.some((avis) => avis.user === utilisateur._id))

  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <ul>
        {produit.reviews.length === 0 && (
          <li className="border-t border-sable py-6 text-brun/80">Aucun avis pour le moment : soyez le premier.</li>
        )}
        {produit.reviews.map((avis) => (
          <li key={avis.user} className="border-t border-sable py-6 last:border-b">
            <div className="flex items-center justify-between gap-4">
              <p className="label">{avis.name}</p>
              <Note valeur={avis.rating} />
            </div>
            <p className="mt-3 text-brun/80">{avis.comment}</p>
          </li>
        ))}
      </ul>

      <div className="h-fit border border-sable bg-beige p-6 xl:p-8">
        <p className="label text-cuivre">Donner mon avis</p>
        <div className="mt-6">
          {!utilisateur && (
            <>
              <p className="text-brun/80">Connectez-vous pour partager votre expérience.</p>
              <Link to={`/connexion?redirect=${encodeURIComponent(`/produit/${produit.slug}`)}`} className="btn btn-contour mt-6">
                Se connecter
              </Link>
            </>
          )}
          {utilisateur && dejaDonne && <p className="text-brun/80">Vous avez déjà donné votre avis sur cette pièce. Merci !</p>}
          {utilisateur && !dejaDonne && <FormulaireAvis produit={produit} utilisateur={utilisateur} />}
        </div>
      </div>
    </div>
  )
}
