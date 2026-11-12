import BandeauConfiance from '../components/home/BandeauConfiance'
import BandeDefilante from '../components/home/BandeDefilante'
import ExplorateurCategories from '../components/home/ExplorateurCategories'
import Hero from '../components/home/Hero'
import ProduitPhare from '../components/home/ProduitPhare'
import { SectionArtisans, SectionAvis, SectionNewsletter } from '../components/home/SectionsMaison'
import SelectionVedette from '../components/home/SelectionVedette'
import TransitionVague from '../components/home/TransitionVague'
import { SeparateurEtoile } from '../components/ui/Etoile'

// Accueil : alternance de sections claires et sombres
export default function Accueil() {
  return (
    <>
      <Hero />
      <TransitionVague />
      <BandeDefilante />
      <ProduitPhare />
      <ExplorateurCategories />
      <SeparateurEtoile />
      <SelectionVedette />
      <SectionArtisans />
      <SectionAvis />
      <BandeauConfiance />
      <SectionNewsletter />
    </>
  )
}
