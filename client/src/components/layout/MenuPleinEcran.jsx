import { useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useOverlay } from '../../hooks/useOverlay'
import { fermerMenu, selectMenuOuvert } from '../../store/slices/uiSlice'
import { deuxChiffres } from '../../utils/format'
import { lienWhatsApp } from '../../utils/whatsapp'

const LIENS = [
  { vers: '/', texte: 'Accueil' },
  { vers: '/catalogue', texte: 'Catalogue' },
  { vers: '/artisans', texte: 'Nos artisans' },
  { vers: '/panier', texte: 'Panier' },
  { vers: '/connexion', texte: 'Mon compte' },
]

const COURBE = [0.76, 0, 0.24, 1]

const rideau = {
  ferme: { clipPath: 'inset(0% 0% 100% 0%)' },
  ouvert: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.8, ease: COURBE } },
  sortie: { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.6, ease: COURBE } },
}

const liste = {
  ouvert: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
}

const ligne = {
  ferme: { y: '110%' },
  ouvert: { y: '0%', transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}

// Menu plein écran animé : rideau sombre puis liens révélés un par un
export default function MenuPleinEcran() {
  const dispatch = useDispatch()
  const estOuvert = useSelector(selectMenuOuvert)
  const fermer = useCallback(() => dispatch(fermerMenu()), [dispatch])
  useOverlay(estOuvert, fermer)

  return (
    <AnimatePresence>
      {estOuvert && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu principal"
          data-lenis-prevent
          variants={rideau}
          initial="ferme"
          animate="ouvert"
          exit="sortie"
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brun text-creme"
        >
          <div className="grid h-entete shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-creme/15 px-gouttiere">
            <button
              type="button"
              onClick={fermer}
              autoFocus
              className="label h-10 justify-self-start rounded border border-creme/40 px-4 transition-colors duration-300 hover:border-ambre hover:bg-ambre hover:text-brun"
            >
              Fermer
            </button>
            <span className="pl-[0.3em] text-[13px] font-medium uppercase tracking-[0.3em] sm:pl-[0.42em] sm:text-[17px] sm:tracking-logo">
              AtlasShop
            </span>
          </div>

          <motion.nav
            variants={liste}
            aria-label="Navigation principale"
            className="flex flex-1 flex-col justify-center px-gouttiere py-10"
          >
            <ul>
              {LIENS.map((lien, position) => (
                <li key={lien.vers} className="overflow-hidden border-b border-creme/15">
                  <motion.div variants={ligne}>
                    <Link
                      to={lien.vers}
                      onClick={fermer}
                      className="group flex items-baseline gap-6 py-3 transition-colors duration-300 hover:text-ambre sm:py-4"
                    >
                      <span className="label w-8 text-taupe">{deuxChiffres(position + 1)}</span>
                      <span className="text-[clamp(36px,7vw,88px)] leading-none tracking-[-0.04em] transition-transform duration-500 ease-luxe group-hover:translate-x-3">
                        {lien.texte}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.nav>

          <div className="flex shrink-0 flex-col gap-4 border-t border-creme/15 px-gouttiere py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="label text-sable">Fait main au Maroc · Livraison partout au Maroc</p>
            <a href={lienWhatsApp()} target="_blank" rel="noopener noreferrer" className="btn btn-clair">
              Demander conseil
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
