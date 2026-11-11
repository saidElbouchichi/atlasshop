import { AnimatePresence, MotionConfig } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Header from './components/layout/Header'
import MenuPleinEcran from './components/layout/MenuPleinEcran'
import OngletPromo from './components/layout/OngletPromo'
import TiroirPanier from './components/layout/TiroirPanier'
import TransitionPage from './components/layout/TransitionPage'
import Curseur from './components/ui/Curseur'
import { useDefilementFluide } from './hooks/useDefilementFluide'
import Accueil from './pages/Accueil'
import EnConstruction from './pages/EnConstruction'
import { revenirEnHaut } from './utils/defilement'

// Routes dont la page arrive dans la suite de la Phase 1
const PAGES_A_VENIR = [
  { chemin: '/catalogue', titre: 'Le catalogue arrive.' },
  { chemin: '/produit/:slug', titre: 'La fiche produit arrive.' },
  { chemin: '/artisans', titre: 'Nos artisans arrivent.' },
  { chemin: '/panier', titre: 'La page panier arrive.' },
  { chemin: '/checkout', titre: 'Le paiement arrive.' },
  { chemin: '/connexion', titre: 'L’espace compte arrive.' },
]

const avecTransition = (page) => <TransitionPage>{page}</TransitionPage>

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
      <Header />
      <OngletPromo />
      <MenuPleinEcran />
      <TiroirPanier />
      <Curseur />

      <div id="contenu">
        <AnimatePresence mode="wait" onExitComplete={revenirEnHaut}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={avecTransition(<Accueil />)} />
            {PAGES_A_VENIR.map((page) => (
              <Route
                key={page.chemin}
                path={page.chemin}
                element={avecTransition(<EnConstruction titre={page.titre} />)}
              />
            ))}
            <Route path="*" element={avecTransition(<EnConstruction introuvable />)} />
          </Routes>
        </AnimatePresence>
      </div>

      <Footer />
    </MotionConfig>
  )
}
