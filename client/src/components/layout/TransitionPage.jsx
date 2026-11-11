import { motion } from 'framer-motion'

const COURBE = [0.76, 0, 0.24, 1]
export const DUREE_RIDEAU = 0.75

// Transition entre pages : le contenu passe en fondu sous un rideau ambre
// qui se lève à l'entrée et remonte à la sortie.
export default function TransitionPage({ children }) {
  return (
    <>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {children}
      </motion.main>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] bg-ambre"
        initial={{ scaleY: 1, originY: 0 }}
        animate={{ scaleY: 0, originY: 0 }}
        exit={{ scaleY: 1, originY: 1 }}
        transition={{ duration: DUREE_RIDEAU, ease: COURBE, originY: { duration: 0 } }}
      />
    </>
  )
}
