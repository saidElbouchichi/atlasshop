import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Etoile, { FiligraneEtoile } from '../components/ui/Etoile'
import { IconeWhatsApp } from '../components/ui/Icones'
import { EnTetePage } from '../components/ui/Page'
import Photo from '../components/ui/Photo'
import { MotVague, SoulignementVague } from '../components/ui/Vague'
import { auteur, ecole } from '../data/projet'
import { useRevelations } from '../hooks/useRevelations'
import { lienWhatsApp } from '../utils/whatsapp'

const ROLES = [
  'Conception du projet et direction artistique',
  'Développement du site, de l’interface à la base de données',
  'Sélection des pièces et lien avec les artisans',
  'Suivi des commandes et relation client',
]

// Page « À propos » : le directeur de projet, sa signature et le cadre GOMYCODE
export default function APropos() {
  const refPage = useRef(null)
  useRevelations(refPage)

  return (
    <>
      <EnTetePage label="À propos" titre="Le projet et celui qui le porte.">
        AtlasShop relie les ateliers du Maroc à votre maison. Derrière le site, un directeur de projet et une école.
      </EnTetePage>

      <div ref={refPage}>
        <section aria-labelledby="titre-directeur" className="grid grid-cols-1 border-b border-sable lg:grid-cols-2">
          <div data-reveal-clip className="aspect-[1100/1031] self-start overflow-hidden bg-sable lg:sticky lg:top-14">
            <Photo image={auteur.portrait} sizes="(min-width: 1024px) 50vw, 100vw" prioritaire className="h-full w-full object-cover" />
          </div>

          <div className="flex flex-col justify-between gap-14 px-gouttiere py-16 lg:py-24">
            <p data-reveal className="label flex items-center gap-3 text-cuivre">
              <Etoile className="h-4 w-4 text-ambre" />
              {auteur.role}
            </p>

            <div>
              <h2 id="titre-directeur" data-reveal className="text-titre">{auteur.nom}</h2>
              <div data-reveal className="mt-8 max-w-lg space-y-4 text-[16px] text-brun/80">
                <p>
                  J'ai imaginé AtlasShop pour donner à l'artisanat marocain la vitrine qu'il mérite : un site soigné, où chaque tapis, chaque poterie et chaque pièce de cuir est présenté avec le nom de celle ou celui qui l'a façonné.
                </p>
                <p>
                  J'ai conçu, dessiné et développé ce projet de bout en bout, de la première maquette jusqu'à la mise en ligne. Mon exigence est simple : que l'expérience en ligne soit à la hauteur du travail fait à la main.
                </p>
              </div>

              <ul data-reveal className="liste-etoiles mt-10 space-y-3">
                {ROLES.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            </div>

            <div data-reveal>
              <p className="label text-cuivre">Signature</p>
              <p className="relative mt-3 w-fit text-[clamp(30px,3.4vw,48px)] font-light italic leading-tight tracking-[-0.02em]">
                {auteur.nom}
                <SoulignementVague className="text-ambre" />
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a href={`mailto:${auteur.email}`} className="btn btn-plein normal-case tracking-normal">{auteur.email}</a>
                <a href={lienWhatsApp('Bonjour Said, je vous contacte à propos d’AtlasShop.')} target="_blank" rel="noopener noreferrer" className="btn btn-contour">
                  <IconeWhatsApp width={16} height={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="titre-ecole" className="relative overflow-hidden bg-brun px-gouttiere py-20 text-creme lg:py-28">
          <FiligraneEtoile />
          <p data-reveal className="label relative text-ambre">Cadre du projet</p>
          <h2 id="titre-ecole" data-reveal className="relative mt-6 max-w-4xl text-titre">
            Un projet encadré et conservé par <MotVague>{ecole.nom}</MotVague>.
          </h2>
          <p data-reveal className="relative mt-8 max-w-xl text-[16px] text-sable">
            AtlasShop est mon projet final de formation. {ecole.nom} en assure l'encadrement pédagogique et en est le garant : l'école est responsable de la conservation du projet, de son code et de sa présentation.
          </p>
          <div className="relative mt-10 flex flex-wrap gap-3">
            <Link to="/catalogue" className="btn border-ambre bg-ambre text-brun hover:bg-creme">Découvrir la collection</Link>
            <Link to="/artisans" className="btn btn-clair">Rencontrer les artisans</Link>
          </div>
        </section>
      </div>
    </>
  )
}
