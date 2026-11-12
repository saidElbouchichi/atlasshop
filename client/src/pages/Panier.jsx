import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Totaux } from '../components/cart/Recapitulatif'
import { SelecteurQuantite } from '../components/ui/Formulaire'
import { EnTetePage } from '../components/ui/Page'
import Photo from '../components/ui/Photo'
import { modifierQuantite, retirerDuPanier, selectArticles, viderPanier } from '../store/slices/cartSlice'
import { calculerTotaux } from '../utils/commande'
import { deuxChiffres, formaterPrix } from '../utils/format'

function LigneArticle({ article }) {
  const dispatch = useDispatch()

  return (
    <li className="grid grid-cols-[88px_1fr] gap-5 border-b border-sable py-6 sm:grid-cols-[120px_1fr_auto] sm:items-center">
      <Link to={`/produit/${article.slug}`} className="block overflow-hidden rounded">
        <Photo image={article.image} sizes="120px" className="aspect-[4/5] w-full object-cover" />
      </Link>
      <div>
        <Link to={`/produit/${article.slug}`} className="text-[22px] leading-tight tracking-[-0.02em] hover:text-ambre">
          {article.name}
        </Link>
        <p className="mt-1 text-ambre">{formaterPrix(article.price)}</p>
        <div className="mt-4 flex items-center gap-4">
          <SelecteurQuantite
            valeur={article.qty}
            max={article.stock}
            surChangement={(qty) => dispatch(modifierQuantite({ id: article.product, qty }))}
          />
          <button type="button" onClick={() => dispatch(retirerDuPanier(article.product))} className="label text-cuivre underline underline-offset-4 hover:text-brun">
            Retirer
          </button>
        </div>
      </div>
      <p className="col-span-2 text-right text-[20px] tabular-nums sm:col-span-1">{formaterPrix(article.price * article.qty)}</p>
    </li>
  )
}

export default function Panier() {
  const dispatch = useDispatch()
  const articles = useSelector(selectArticles)
  const totaux = calculerTotaux(articles)

  return (
    <>
      <EnTetePage label={`Panier · ${deuxChiffres(articles.length)} pièce${articles.length > 1 ? 's' : ''}`} titre="Votre panier" />

      {articles.length === 0 ? (
        <section className="px-gouttiere py-24">
          <p className="text-sous-titre">Votre panier est vide.</p>
          <p className="mt-4 max-w-md text-brun/80">Chaque pièce est façonnée à la main : prenez le temps de choisir la vôtre.</p>
          <Link to="/catalogue" className="btn btn-plein mt-8">Découvrir la collection</Link>
        </section>
      ) : (
        <section className="grid gap-12 px-gouttiere py-12 lg:grid-cols-[1fr_400px] lg:py-16">
          <div>
            <ul className="border-t border-sable">
              {articles.map((article) => (
                <LigneArticle key={article.product} article={article} />
              ))}
            </ul>
            <button type="button" onClick={() => dispatch(viderPanier())} className="label mt-6 text-cuivre underline underline-offset-4 hover:text-brun">
              Vider le panier
            </button>
          </div>

          <aside className="h-fit border border-sable bg-beige p-6 lg:sticky lg:top-[calc(theme(spacing.entete)+24px)] xl:p-8">
            <p className="label mb-6 text-cuivre">Récapitulatif</p>
            <Totaux {...totaux} />
            <Link to="/checkout" className="btn btn-plein mt-8 w-full">Passer la commande</Link>
            <Link to="/catalogue" className="lien-ambre mx-auto mt-5 block w-fit">Continuer mes achats</Link>
          </aside>
        </section>
      )}
    </>
  )
}
