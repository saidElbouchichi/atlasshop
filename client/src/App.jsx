import { AnimatePresence, MotionConfig } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import EcranChargement from './components/layout/EcranChargement'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import MenuPleinEcran from './components/layout/MenuPleinEcran'
import OngletPromo from './components/layout/OngletPromo'
import TiroirPanier from './components/layout/TiroirPanier'
import TransitionPage from './components/layout/TransitionPage'
import Curseur from './components/ui/Curseur'
import { RouteProtegee } from './components/ui/Page'
import Toasts from './components/ui/Toasts'
import { useDefilementFluide } from './hooks/useDefilementFluide'
import Accueil from './pages/Accueil'
import Artisans from './pages/Artisans'
import Catalogue from './pages/Catalogue'
import Checkout from './pages/Checkout'
import Compte from './pages/Compte'
import Confirmation from './pages/Confirmation'
import FicheProduit from './pages/FicheProduit'
import PageIntrouvable from './pages/PageIntrouvable'
import Panier from './pages/Panier'
import Profil from './pages/Profil'
import Admin from './pages/admin/Admin'
import { revenirEnHaut } from './utils/defilement'

const PREFIXE_ADMIN = '/admin'

// Dans l'admin, on change d'onglet sans rejouer le rideau de transition
const cleDeTransition = (chemin) => (chemin.startsWith(PREFIXE_ADMIN) ? PREFIXE_ADMIN : chemin)

const page = (contenu) => <TransitionPage>{contenu}</TransitionPage>
const pageProtegee = (contenu, options) => page(<RouteProtegee {...options}>{contenu}</RouteProtegee>)

export default function App() {
  const location = useLocation()
  useDefilementFluide()

  return (
    // reducedMotion="user" : Framer Motion respecte prefers-reduced-motion
    <MotionConfig reducedMotion="user">
      <a
        href="#contenu"
        className="btn btn-plein sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80]"
      >
        Aller au contenu
      </a>
      <EcranChargement />
      <Header />
      <OngletPromo />
      <MenuPleinEcran />
      <TiroirPanier />
      <Curseur />
      <Toasts />

      <div id="contenu">
        <AnimatePresence mode="wait" initial={false} onExitComplete={revenirEnHaut}>
          <Routes location={location} key={cleDeTransition(location.pathname)}>
            <Route path="/" element={page(<Accueil />)} />
            <Route path="/catalogue" element={page(<Catalogue />)} />
            <Route path="/produit/:slug" element={page(<FicheProduit />)} />
            <Route path="/artisans" element={page(<Artisans />)} />
            <Route path="/panier" element={page(<Panier />)} />
            <Route path="/connexion" element={page(<Compte mode="connexion" />)} />
            <Route path="/inscription" element={page(<Compte mode="inscription" />)} />
            <Route path="/checkout" element={pageProtegee(<Checkout />)} />
            <Route path="/confirmation/:id" element={pageProtegee(<Confirmation />)} />
            <Route path="/profil" element={pageProtegee(<Profil />)} />
            <Route path="/admin/*" element={pageProtegee(<Admin />, { admin: true })} />
            <Route path="*" element={page(<PageIntrouvable />)} />
          </Routes>
        </AnimatePresence>
      </div>

      <Footer />
    </MotionConfig>
  )
}
