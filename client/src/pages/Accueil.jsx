import BandeauConfiance from '../components/home/BandeauConfiance'
import BandeDefilante from '../components/home/BandeDefilante'
import Hero from '../components/home/Hero'
import ProduitPhare from '../components/home/ProduitPhare'
import SelectionVedette from '../components/home/SelectionVedette'
import TransitionVague from '../components/home/TransitionVague'
import { SeparateurEtoile } from '../components/ui/Etoile'

// Accueil : alternance de sections claires et sombres.
// À venir dans la suite de la Phase 1 : section artisans, avis clients, newsletter.
export default function Accueil() {
  return (
    <>
      <Hero />
      <TransitionVague />
      <BandeDefilante />
      <ProduitPhare />
      <div className="pt-20 lg:pt-28">
        <SeparateurEtoile />
      </div>
      <SelectionVedette />
      <BandeauConfiance />
    </>
  )
}
