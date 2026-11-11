import { useRef } from 'react'
import { useRevelations } from '../../hooks/useRevelations'
import { lienWhatsApp } from '../../utils/whatsapp'
import { IconeCadenas, IconeLivraison, IconeMain, IconeWhatsApp } from '../ui/Icones'

const ENGAGEMENTS = [
  {
    Icone: IconeMain,
    titre: 'Fait main au Maroc',
    texte: "Chaque pièce est signée par l'artisan ou la coopérative qui l'a façonnée.",
  },
  {
    Icone: IconeLivraison,
    titre: 'Livraison partout au Maroc',
    texte: 'Expédition soignée sous 48 h, suivie jusqu’à votre porte.',
  },
  {
    Icone: IconeCadenas,
    titre: 'Paiement sécurisé',
    texte: 'Règlement par carte via Stripe, sans conservation de vos données bancaires.',
  },
]

// Section sombre : badges de confiance et appel à demander conseil sur WhatsApp
export default function BandeauConfiance() {
  const refSection = useRef(null)
  useRevelations(refSection)

  return (
    <section ref={refSection} aria-labelledby="titre-confiance" className="bg-brun text-creme">
      <div className="flex flex-col gap-10 px-gouttiere py-20 lg:flex-row lg:items-end lg:justify-between lg:py-28">
        <h2 id="titre-confiance" data-reveal className="max-w-4xl text-titre">
          Une question&nbsp;? Un <span className="text-ambre">artisan</span> vous répond.
        </h2>
        <a
          data-reveal
          href={lienWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-clair h-14 shrink-0 px-8"
        >
          <IconeWhatsApp width={16} height={16} />
          Demander conseil
        </a>
      </div>

      <ul className="grid grid-cols-1 border-t border-creme/15 md:grid-cols-3">
        {ENGAGEMENTS.map(({ Icone, titre, texte }) => (
          <li
            key={titre}
            data-reveal
            className="border-b border-creme/15 px-gouttiere py-10 md:border-b-0 md:border-r md:last:border-r-0"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded border border-creme/40 text-ambre">
              <Icone />
            </span>
            <p className="label mt-6">{titre}</p>
            <p className="mt-2 max-w-xs text-sable">{texte}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
