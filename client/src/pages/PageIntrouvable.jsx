import { Link } from 'react-router-dom'
import Etoile, { FiligraneEtoile } from '../components/ui/Etoile'
import { MotVague } from '../components/ui/Vague'

// Page 404 stylée, sur fond sombre avec l'étoile du logo en filigrane
export default function PageIntrouvable() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-brun px-gouttiere pb-20 pt-entete text-creme">
      <FiligraneEtoile className="-right-40 top-1/2 h-[720px] w-[720px] -translate-y-1/2" />
      <p className="label relative flex items-center gap-3 text-ambre">
        <Etoile className="h-4 w-4" />
        Erreur 404
      </p>
      <h1 className="relative mt-8 max-w-5xl text-hero">
        Cette page s'est <MotVague>égarée</MotVague> dans le souk.
      </h1>
      <p className="relative mt-10 max-w-md text-[16px] text-sable">
        L'adresse demandée n'existe pas ou a été déplacée. Reprenons le fil depuis l'atelier.
      </p>
      <div className="relative mt-10 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-clair">
          Retour à l'accueil
        </Link>
        <Link to="/catalogue" className="btn border-ambre bg-ambre text-brun hover:bg-creme">
          Voir le catalogue
        </Link>
      </div>
    </section>
  )
}
