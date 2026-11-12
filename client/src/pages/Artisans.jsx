import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChiffresMaison } from '../components/home/SectionsMaison'
import Etoile, { FiligraneEtoile, SeparateurEtoile } from '../components/ui/Etoile'
import { IconeWhatsApp } from '../components/ui/Icones'
import { EnTetePage } from '../components/ui/Page'
import Photo from '../components/ui/Photo'
import { MotVague } from '../components/ui/Vague'
import { artisans } from '../data/mock'
import { useRevelations } from '../hooks/useRevelations'
import { deuxChiffres } from '../utils/format'
import { lienWhatsApp } from '../utils/whatsapp'

const ENGAGEMENTS = [
  'Un prix fixé par l’artisan, payé à la commande',
  'Des matières naturelles et locales : laine, terre, cuir, argan',
  'Aucun intermédiaire entre l’atelier et vous',
  'Une carte signée glissée dans chaque colis',
]

function PortraitArtisan({ artisan, rang }) {
  const inverse = rang % 2 === 1
  return (
    <article className="grid grid-cols-1 border-b border-sable lg:grid-cols-2">
      <div data-reveal-clip className={`relative min-h-[60svh] overflow-hidden bg-sable lg:min-h-[80vh] ${inverse ? 'lg:order-2' : ''}`}>
        <div className="absolute -inset-y-[8%] inset-x-0">
          <Photo data-parallaxe image={artisan.image} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="flex flex-col justify-between gap-12 px-gouttiere py-16 lg:py-24">
        <p data-reveal className="label text-cuivre">
          {deuxChiffres(rang + 1)} · {artisan.metier} · {artisan.lieu}
        </p>
        <div>
          <h2 data-reveal className="text-titre">{artisan.nom}</h2>
          <p data-reveal className="mt-8 max-w-md text-[16px] text-brun/80">{artisan.texte}</p>
        </div>
      </div>
    </article>
  )
}

// Page « Nos artisans » : storytelling, portraits, chiffres animés
export default function Artisans() {
  const refPage = useRef(null)
  useRevelations(refPage)

  return (
    <>
      <EnTetePage label="Nos artisans" titre="Des mains, des lieux, des histoires.">
        AtlasShop est né dans les ateliers : nous sélectionnons chaque pièce sur place, auprès de celles et ceux qui la fabriquent.
      </EnTetePage>

      <div ref={refPage}>
      {artisans.map((artisan, rang) => (
        <PortraitArtisan key={artisan.nom} artisan={artisan} rang={rang} />
      ))}

      <section aria-label="La maison en chiffres">
        <ChiffresMaison />
      </section>

      <section className="grid gap-12 px-gouttiere py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p data-reveal className="label flex items-center gap-3 text-cuivre">
            <Etoile className="h-4 w-4 text-ambre" />
            Notre engagement
          </p>
          <h2 data-reveal className="mt-6 text-titre">
            Un commerce <MotVague>juste</MotVague>, de l'atelier à chez vous.
          </h2>
        </div>
        <ul data-reveal className="liste-etoiles space-y-5 self-end text-[18px]">
          {ENGAGEMENTS.map((engagement) => (
            <li key={engagement} className="border-b border-sable pb-5">{engagement}</li>
          ))}
        </ul>
      </section>

      <SeparateurEtoile />

      <section className="relative mt-20 overflow-hidden bg-brun px-gouttiere py-20 text-creme lg:py-28">
        <FiligraneEtoile />
        <h2 data-reveal className="relative max-w-4xl text-titre">Envie d'une pièce sur mesure ?</h2>
        <p data-reveal className="relative mt-6 max-w-md text-sable">
          Dimensions, couleurs, motifs : nos artisans réalisent aussi des commandes spéciales.
        </p>
        <div className="relative mt-10 flex flex-wrap gap-3">
          <a href={lienWhatsApp('Bonjour AtlasShop, je souhaite une pièce sur mesure.')} target="_blank" rel="noopener noreferrer" className="btn btn-clair">
            <IconeWhatsApp width={16} height={16} />
            Demander conseil
          </a>
          <Link to="/catalogue" className="btn border-ambre bg-ambre text-brun hover:bg-creme">Voir la collection</Link>
        </div>
      </section>
      </div>
    </>
  )
}
