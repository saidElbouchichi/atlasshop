import { SEUIL_LIVRAISON_OFFERTE } from '../../utils/commande'
import { formaterPrix } from '../../utils/format'
import Photo from '../ui/Photo'

// Liste compacte des articles (checkout, confirmation, profil)
export function ListeArticles({ articles }) {
  return (
    <ul>
      {articles.map((article) => (
        <li key={article.product} className="flex items-center gap-4 border-b border-sable py-4">
          <Photo image={article.image} sizes="64px" className="h-16 w-14 shrink-0 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate leading-tight">{article.name}</p>
            <p className="label mt-1 text-cuivre">Quantité · {article.qty}</p>
          </div>
          <p className="shrink-0 tabular-nums">{formaterPrix(article.price * article.qty)}</p>
        </li>
      ))}
    </ul>
  )
}

// Sous-total, livraison et total d'un panier ou d'une commande
export function Totaux({ itemsPrice, shippingPrice, totalPrice }) {
  return (
    <dl className="space-y-3">
      <div className="flex justify-between">
        <dt className="label text-cuivre">Sous-total</dt>
        <dd className="tabular-nums">{formaterPrix(itemsPrice)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="label text-cuivre">Livraison</dt>
        <dd className="tabular-nums">{shippingPrice === 0 ? 'Offerte' : formaterPrix(shippingPrice)}</dd>
      </div>
      {shippingPrice > 0 && (
        <p className="text-[13px] text-cuivre">Livraison offerte dès {formaterPrix(SEUIL_LIVRAISON_OFFERTE)} d'achat.</p>
      )}
      <div className="flex items-baseline justify-between border-t border-sable pt-4">
        <dt className="label">Total</dt>
        <dd className="text-[26px] tracking-[-0.02em] text-ambre">{formaterPrix(totalPrice)}</dd>
      </div>
    </dl>
  )
}
