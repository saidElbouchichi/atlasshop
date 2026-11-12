import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import GrilleProduits from '../components/product/GrilleProduits'
import { Chargeur } from '../components/ui/Etoile'
import { EnTetePage, SqueletteCarte } from '../components/ui/Page'
import { selectCategories } from '../store/slices/categoriesSlice'
import { selectProduits } from '../store/slices/productsSlice'
import { TRIS, chercherProduits, lireCriteres } from '../utils/catalogue'
import { deuxChiffres } from '../utils/format'
import { revenirEnHaut } from '../utils/defilement'

const DELAI_RECHERCHE_MS = 350
const DUREE_SQUELETTE_MS = 450

const classePastille = (active) =>
  `label h-10 rounded border px-4 transition-colors duration-300 ${
    active ? 'border-brun bg-brun text-creme' : 'border-sable hover:border-brun'
  }`

// Simule le temps de réponse de l'API pour montrer les skeletons (remplacé par le vrai statut en Phase 2)
function useChargementSimule(cle) {
  const [charge, setCharge] = useState(false)
  useEffect(() => {
    setCharge(false)
    const minuterie = window.setTimeout(() => setCharge(true), DUREE_SQUELETTE_MS)
    return () => window.clearTimeout(minuterie)
  }, [cle])
  return charge
}

function Pagination({ page, totalPages, surChangement }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, position) => position + 1)

  return (
    <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
      <button type="button" onClick={() => surChangement(page - 1)} disabled={page === 1} className="btn btn-contour h-10 px-4 disabled:opacity-30">
        Précédent
      </button>
      {pages.map((numero) => (
        <button
          key={numero}
          type="button"
          onClick={() => surChangement(numero)}
          aria-current={numero === page ? 'page' : undefined}
          className={`${classePastille(numero === page)} w-10 px-0 tabular-nums`}
        >
          {deuxChiffres(numero)}
        </button>
      ))}
      <button type="button" onClick={() => surChangement(page + 1)} disabled={page === totalPages} className="btn btn-contour h-10 px-4 disabled:opacity-30">
        Suivant
      </button>
    </nav>
  )
}

// Catalogue : recherche, filtres par catégorie et par prix, tri et pagination.
// Tous les critères vivent dans l'URL, comme les futurs paramètres de l'API.
export default function Catalogue() {
  const [parametres, setParametres] = useSearchParams()
  const produits = useSelector(selectProduits)
  const categories = useSelector(selectCategories)
  const criteres = useMemo(() => lireCriteres(parametres), [parametres])
  const resultat = useMemo(() => chercherProduits(produits, criteres), [produits, criteres])
  const [recherche, setRecherche] = useState(criteres.q)
  const [filtresOuverts, setFiltresOuverts] = useState(false)
  const charge = useChargementSimule(parametres.toString())

  const modifier = (changements, { garderPage = false } = {}) => {
    const suivants = new URLSearchParams(parametres)
    Object.entries(changements).forEach(([cle, valeur]) => {
      if (valeur === '' || valeur === null || valeur === undefined) suivants.delete(cle)
      else suivants.set(cle, String(valeur))
    })
    if (!garderPage) suivants.delete('page')
    setParametres(suivants, { replace: true })
  }

  // La recherche n'est envoyée dans l'URL qu'après une courte pause de frappe
  useEffect(() => {
    if (recherche === criteres.q) return undefined
    const minuterie = window.setTimeout(() => modifier({ q: recherche }), DELAI_RECHERCHE_MS)
    return () => window.clearTimeout(minuterie)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recherche])

  const changerPage = (page) => {
    modifier({ page: page === 1 ? '' : page }, { garderPage: true })
    revenirEnHaut()
  }

  const reinitialiser = () => {
    setRecherche('')
    setParametres({}, { replace: true })
  }

  const filtresActifs = Boolean(criteres.q || criteres.category || criteres.minPrice !== null || criteres.maxPrice !== null)

  return (
    <>
      <EnTetePage label={`Catalogue · ${deuxChiffres(resultat.total)} pièces`} titre="Toute la collection">
        Tapis, poteries, cuirs, soins naturels et objets de décoration, façonnés à la main dans les ateliers du Maroc.
      </EnTetePage>

      <section className="px-gouttiere py-10 lg:py-14" aria-label="Produits">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
            <button type="button" onClick={() => modifier({ category: '' })} aria-pressed={!criteres.category} className={classePastille(!criteres.category)}>
              Tout
            </button>
            {categories.map((categorie) => (
              <button
                key={categorie._id}
                type="button"
                onClick={() => modifier({ category: categorie.slug })}
                aria-pressed={criteres.category === categorie.slug}
                className={classePastille(criteres.category === categorie.slug)}
              >
                {categorie.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFiltresOuverts((ouvert) => !ouvert)}
              aria-expanded={filtresOuverts}
              aria-controls="panneau-filtres"
              className={classePastille(filtresOuverts)}
            >
              Filtres {filtresActifs ? '•' : '+'}
            </button>
            <label className="sr-only" htmlFor="tri-catalogue">
              Trier les produits
            </label>
            <select
              id="tri-catalogue"
              value={criteres.sort}
              onChange={(evenement) => modifier({ sort: evenement.target.value })}
              className="label h-10 rounded border border-sable bg-transparent px-3 focus:border-brun focus:outline-none"
            >
              {TRIS.map((tri) => (
                <option key={tri.valeur} value={tri.valeur}>
                  {tri.texte}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filtresOuverts && (
            <motion.div
              id="panneau-filtres"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid gap-4 border-y border-sable py-6 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
                <label className="block">
                  <span className="label mb-2 block text-cuivre">Recherche</span>
                  <input
                    type="search"
                    value={recherche}
                    onChange={(evenement) => setRecherche(evenement.target.value)}
                    placeholder="Tapis, cuir, Fès…"
                    maxLength={80}
                    className="h-12 w-full rounded border border-sable bg-transparent px-4 focus:border-brun focus:outline-none"
                  />
                </label>
                {[
                  { cle: 'minPrice', texte: 'Prix min (MAD)' },
                  { cle: 'maxPrice', texte: 'Prix max (MAD)' },
                ].map(({ cle, texte }) => (
                  <label key={cle} className="block">
                    <span className="label mb-2 block text-cuivre">{texte}</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      inputMode="numeric"
                      value={criteres[cle] ?? ''}
                      onChange={(evenement) => modifier({ [cle]: evenement.target.value })}
                      className="h-12 w-full rounded border border-sable bg-transparent px-4 focus:border-brun focus:outline-none"
                    />
                  </label>
                ))}
                <button type="button" onClick={reinitialiser} disabled={!filtresActifs} className="btn btn-contour disabled:opacity-30">
                  Réinitialiser
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="label mt-8 text-cuivre" role="status">
          {resultat.total} résultat{resultat.total > 1 ? 's' : ''} · page {deuxChiffres(resultat.page)} / {deuxChiffres(resultat.totalPages)}
        </p>

        <div className="mt-6">
          {!charge && (
            <div className="grid grid-cols-1 gap-px border border-sable bg-sable lg:grid-cols-2">
              <SqueletteCarte />
              <SqueletteCarte />
              <span className="sr-only">
                <Chargeur />
              </span>
            </div>
          )}
          {charge && resultat.total > 0 && <GrilleProduits produits={resultat.elements} />}
          {charge && resultat.total === 0 && (
            <div className="border border-sable bg-beige px-6 py-20 text-center">
              <p className="text-sous-titre">Aucune pièce ne correspond.</p>
              <p className="mt-4 text-brun/80">Essayez d'élargir votre recherche ou de retirer un filtre.</p>
              <button type="button" onClick={reinitialiser} className="btn btn-plein mt-8">
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {charge && <Pagination page={resultat.page} totalPages={resultat.totalPages} surChangement={changerPage} />}
      </section>
    </>
  )
}
