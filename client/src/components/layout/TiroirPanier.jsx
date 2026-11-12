import { useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useOverlay } from '../../hooks/useOverlay'
import {
  modifierQuantite,
  retirerDuPanier,
  selectArticles,
  selectSousTotal,
} from '../../store/slices/cartSlice'
import { fermerPanier, selectPanierOuvert } from '../../store/slices/uiSlice'
import { formaterPrix } from '../../utils/format'
import { urlPhoto } from '../../utils/images'
import { IconeFermer } from '../ui/Icones'

const COURBE = [0.22, 1, 0.36, 1]

function LignePanier({ article }) {
  const dispatch = useDispatch()
  const changer = (qty) => dispatch(modifierQuantite({ id: article.product, qty }))

  return (
    <li className="flex gap-4 border-b border-sable py-5">
      <img
        src={urlPhoto(article.image.id, 240)}
        alt={article.image.alt}
        loading="lazy"
        className="h-24 w-20 shrink-0 rounded object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[17px] leading-tight tracking-[-0.01em]">{article.name}</p>
          <button
            type="button"
            onClick={() => dispatch(retirerDuPanier(article.product))}
            aria-label={`Retirer ${article.name} du panier`}
            className="text-cuivre transition-colors hover:text-brun"
          >
            <IconeFermer width={14} height={14} />
          </button>
        </div>
        <p className="mt-1 text-ambre">{formaterPrix(article.price)}</p>
        <div className="mt-auto flex h-8 w-fit items-center rounded border border-sable">
          <button
            type="button"
            onClick={() => changer(article.qty - 1)}
            disabled={article.qty <= 1}
            aria-label="Diminuer la quantité"
            className="h-full w-8 transition-colors hover:bg-sable disabled:opacity-30"
          >
            −
          </button>
          <span className="w-8 text-center text-[13px] tabular-nums" aria-live="polite">
            {article.qty}
          </span>
          <button
            type="button"
            onClick={() => changer(article.qty + 1)}
            disabled={article.qty >= article.stock}
            aria-label="Augmenter la quantité"
            className="h-full w-8 transition-colors hover:bg-sable disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </li>
  )
}

// Panier en tiroir latéral (plein écran sur mobile)
export default function TiroirPanier() {
  const dispatch = useDispatch()
  const estOuvert = useSelector(selectPanierOuvert)
  const articles = useSelector(selectArticles)
  const sousTotal = useSelector(selectSousTotal)
  const fermer = useCallback(() => dispatch(fermerPanier()), [dispatch])
  useOverlay(estOuvert, fermer)

  return (
    <AnimatePresence>
      {estOuvert && (
        <>
          <motion.div
            aria-hidden="true"
            onClick={fermer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-brun/50"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Votre panier"
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: '0%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: COURBE }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-sable bg-creme"
          >
            <div className="flex h-entete shrink-0 items-center justify-between border-b border-sable px-6">
              <p className="label">Votre panier ({articles.length})</p>
              <button type="button" onClick={fermer} autoFocus aria-label="Fermer le panier" className="case-icone">
                <IconeFermer />
              </button>
            </div>

            {articles.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
                <p className="text-sous-titre">Votre panier est vide.</p>
                <p className="max-w-xs text-cuivre">
                  Chaque pièce est façonnée à la main : prenez le temps de choisir la vôtre.
                </p>
                <Link to="/catalogue" onClick={fermer} className="btn btn-plein">
                  Découvrir la collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6">
                  {articles.map((article) => (
                    <LignePanier key={article.product} article={article} />
                  ))}
                </ul>
                <div className="shrink-0 border-t border-sable bg-beige px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="label text-cuivre">Sous-total</span>
                    <span className="text-[22px] tracking-[-0.02em]">{formaterPrix(sousTotal)}</span>
                  </div>
                  <p className="mt-1 text-[13px] text-cuivre">Livraison calculée à l'étape suivante.</p>
                  <Link to="/checkout" onClick={fermer} className="btn btn-plein mt-5 w-full">
                    Commander
                  </Link>
                  <Link to="/panier" onClick={fermer} className="lien-ambre mt-4 block text-center">
                    Voir le panier
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
