import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { retirerToast, selectToasts } from '../../store/slices/uiSlice'
import Etoile from './Etoile'
import { IconeFermer } from './Icones'

const DUREE_AFFICHAGE_MS = 4000

function Toast({ toast }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const minuterie = window.setTimeout(() => dispatch(retirerToast(toast.id)), DUREE_AFFICHAGE_MS)
    return () => window.clearTimeout(minuterie)
  }, [dispatch, toast.id])

  return (
    <motion.li
      layout
      role={toast.type === 'erreur' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto flex items-start gap-3 rounded border border-creme/15 bg-brun px-4 py-3 text-creme"
    >
      <Etoile className={`mt-1 h-3.5 w-3.5 shrink-0 ${toast.type === 'erreur' ? 'text-creme' : 'text-ambre'}`} />
      <p className="flex-1 text-[14px] leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={() => dispatch(retirerToast(toast.id))}
        aria-label="Fermer la notification"
        className="mt-0.5 text-dune transition-colors hover:text-creme"
      >
        <IconeFermer width={13} height={13} />
      </button>
    </motion.li>
  )
}

// Notifications discrètes en bas à droite, aux couleurs du thème
export default function Toasts() {
  const toasts = useSelector(selectToasts)

  return (
    <ul className="pointer-events-none fixed inset-x-4 bottom-20 z-[75] flex flex-col gap-2 sm:left-auto sm:right-6 sm:w-[360px]">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </ul>
  )
}
