import { Link } from 'react-router-dom'

// Onglet vertical collé au bord gauche de l'écran (à partir de la tablette,
// pour ne pas recouvrir le contenu sur mobile)
export default function OngletPromo() {
  return (
    <Link
      to="/catalogue"
      className="label fixed left-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-r bg-ambre px-1.5 py-4 text-brun transition-colors duration-300 [writing-mode:vertical-rl] hover:bg-brun hover:text-creme md:block"
    >
      <span className="block rotate-180">Promo -10&nbsp;%</span>
    </Link>
  )
}
