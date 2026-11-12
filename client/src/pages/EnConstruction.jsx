import { Link } from 'react-router-dom'

// Page provisoire pour les routes prévues dans la suite de la Phase 1
// (ou page 404 quand `introuvable` est vrai).
export default function EnConstruction({ titre = 'Bientôt disponible', introuvable = false }) {
  return (
    <section className="flex min-h-[100svh] flex-col justify-center px-gouttiere pb-20 pt-entete">
      <p className="label flex items-center gap-3 text-cuivre">
        <span className="h-px w-10 bg-cuivre" aria-hidden="true" />
        {introuvable ? 'Erreur 404' : 'Atelier en cours'}
      </p>
      <h1 className="mt-8 max-w-5xl text-hero">{introuvable ? 'Cette page s’est égarée dans le souk.' : titre}</h1>
      <p className="mt-8 max-w-md text-[16px] text-brun/80">
        {introuvable
          ? "L'adresse demandée n'existe pas ou a été déplacée."
          : 'Cette page est encore sur le métier à tisser : elle arrive dans la suite de la Phase 1.'}
      </p>
      <Link to="/" className="btn btn-plein mt-10 w-fit">
        Retour à l'accueil
      </Link>
    </section>
  )
}
