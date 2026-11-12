import { useRef } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { useRevelations } from '../../hooks/useRevelations'
import { selectUtilisateur } from '../../store/slices/authSlice'
import { MotsReveles } from './Mouvement'

// En-tête commun des pages intérieures : petit label, grand titre, texte d'introduction
export function EnTetePage({ label, titre, children, compact = false }) {
  const refEnTete = useRef(null)
  useRevelations(refEnTete)

  return (
    <header
      ref={refEnTete}
      className={`border-b border-sable px-gouttiere pt-[calc(theme(spacing.entete)+48px)] ${compact ? 'pb-10' : 'pb-14 lg:pb-20'}`}
    >
      <p data-reveal className="label flex items-center gap-3 text-cuivre">
        <span className="h-px w-10 bg-cuivre" aria-hidden="true" />
        {label}
      </p>
      <h1 data-titre-mots className={`mt-6 max-w-5xl ${compact ? 'text-sous-titre' : 'text-titre'}`}>
        <MotsReveles texte={titre} />
      </h1>
      {children && (
        <div data-reveal className="mt-6 max-w-xl text-[16px] text-brun/80">
          {children}
        </div>
      )}
    </header>
  )
}

// Bloc gris-beige animé affiché pendant un chargement
export function Squelette({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-sable/60 ${className}`} />
}

// Squelette d'une carte produit « fiche technique »
export function SqueletteCarte() {
  return (
    <div className="grid grid-cols-1 bg-beige sm:grid-cols-[45%_55%]" aria-hidden="true">
      <div className="order-2 flex flex-col gap-4 p-6 sm:order-1 xl:p-8">
        <Squelette className="h-5 w-20" />
        <Squelette className="h-8 w-3/4" />
        <Squelette className="h-5 w-24" />
        <Squelette className="mt-4 h-16 w-full" />
        <Squelette className="h-20 w-full" />
        <Squelette className="mt-auto h-12 w-full" />
      </div>
      <div className="order-1 aspect-square p-6 sm:order-2 sm:aspect-auto sm:min-h-[560px] xl:p-10">
        <Squelette className="h-full w-full" />
      </div>
    </div>
  )
}

// Route réservée aux utilisateurs connectés (et aux admins si `admin` est vrai).
// Protection d'interface uniquement : la vraie vérification se fera côté serveur en Phase 2.
export function RouteProtegee({ admin = false, children }) {
  const utilisateur = useSelector(selectUtilisateur)
  const location = useLocation()

  if (!utilisateur) {
    return <Navigate to={`/connexion?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }
  if (admin && utilisateur.role !== 'admin') return <Navigate to="/profil" replace />
  return children
}
