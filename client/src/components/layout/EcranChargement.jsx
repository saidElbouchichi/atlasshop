import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { bloquerDefilement, debloquerDefilement } from '../../utils/defilement'
import { DUREE_CHARGEMENT, DUREE_OUVERTURE, chargementActif, marquerIntroVue } from '../../utils/intro'
import { BOITE_VAGUE, TRACE_VAGUE } from '../ui/Vague'

const COURBE = [0.76, 0, 0.24, 1]
const ouverture = { duration: DUREE_OUVERTURE, ease: COURBE }

// Écran de chargement du premier affichage : le logo apparaît en fondu,
// la vague se dessine, puis le rideau crème s'ouvre en deux sur la page.
export default function EcranChargement() {
  const [visible, setVisible] = useState(chargementActif)

  useEffect(() => {
    if (!chargementActif) return undefined

    bloquerDefilement()
    const minuterie = window.setTimeout(() => {
      marquerIntroVue()
      debloquerDefilement()
      setVisible(false)
    }, DUREE_CHARGEMENT * 1000)

    return () => {
      window.clearTimeout(minuterie)
      debloquerDefilement()
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chargement"
          role="status"
          aria-label="Chargement d'AtlasShop"
          className="fixed inset-0 z-[90] flex items-center justify-center"
          exit={{ pointerEvents: 'none', transition: { duration: DUREE_OUVERTURE } }}
        >
          {/* Les deux moitiés du rideau crème */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1/2 bg-creme"
            exit={{ y: '-100%', transition: ouverture }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/2 bg-creme"
            exit={{ y: '100%', transition: ouverture }}
          />

          <motion.div
            className="relative flex flex-col items-center"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.img
              src="/logo-marque.webp"
              alt=""
              width="188"
              height="120"
              className="h-[120px] w-auto"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            <svg viewBox={BOITE_VAGUE} className="mt-5 h-5 w-44 overflow-visible text-ambre" aria-hidden="true">
              <motion.path
                d={TRACE_VAGUE}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: 0.6, ease: 'easeInOut' }}
              />
            </svg>
            <motion.p
              className="mt-5 pl-[0.42em] text-[13px] font-medium uppercase tracking-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              AtlasShop
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
