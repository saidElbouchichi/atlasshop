import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { artisans, chiffresMaison, temoignages } from '../../data/mock'
import { useFormulaire } from '../../hooks/useFormulaire'
import { useRevelations } from '../../hooks/useRevelations'
import { useToast } from '../../hooks/useToast'
import { estEmailValide } from '../../utils/validation'
import Compteur from '../ui/Compteur'
import Etoile, { FiligraneEtoile } from '../ui/Etoile'
import { Champ, Note } from '../ui/Formulaire'
import { MotsReveles } from '../ui/Mouvement'
import Photo from '../ui/Photo'
import { MotVague } from '../ui/Vague'

// Chiffres animés de la maison (accueil et page artisans)
export function ChiffresMaison({ sombre = false }) {
  return (
    <dl className={`grid grid-cols-2 border-t lg:grid-cols-4 ${sombre ? 'border-creme/15' : 'border-sable'}`}>
      {chiffresMaison.map((chiffre) => (
        <div key={chiffre.texte} data-reveal className={`border-b px-gouttiere py-10 lg:border-b-0 lg:border-r lg:last:border-r-0 ${sombre ? 'border-creme/15' : 'border-sable'}`}>
          <dd className="text-[clamp(40px,5vw,80px)] leading-none tracking-[-0.04em]">
            <Compteur valeur={chiffre.valeur} suffixe={chiffre.suffixe} />
          </dd>
          <dt className={`label mt-3 ${sombre ? 'text-dune' : 'text-cuivre'}`}>{chiffre.texte}</dt>
        </div>
      ))}
    </dl>
  )
}

// Section artisans de l'accueil : sombre, photo en clip-path et chiffres animés
export function SectionArtisans() {
  const refSection = useRef(null)
  useRevelations(refSection)
  const artisan = artisans[0]

  return (
    <section ref={refSection} aria-labelledby="titre-artisans" className="relative overflow-hidden bg-brun text-creme">
      <FiligraneEtoile className="-left-40 -top-40 h-[620px] w-[620px]" />
      <div className="relative grid grid-cols-1 lg:grid-cols-2">
        <div data-reveal-clip className="relative min-h-[60svh] overflow-hidden lg:min-h-[90vh]">
          <div className="absolute -inset-y-[8%] inset-x-0">
            <Photo data-parallaxe image={artisan.image} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-16 px-gouttiere py-20 lg:py-28">
          <p data-reveal className="label flex items-center gap-3 text-ambre">
            <Etoile className="h-4 w-4" />
            Nos artisans
          </p>
          <div>
            <h2 id="titre-artisans" data-reveal className="text-titre">
              Derrière chaque pièce, une <MotVague>main</MotVague>.
            </h2>
            <p data-reveal className="mt-8 max-w-md text-[16px] text-sable">
              Nous travaillons en direct avec des artisans et des coopératives de douze régions. Ils fixent leur prix ; nous racontons leur histoire.
            </p>
            <Link data-reveal to="/artisans" className="btn btn-clair mt-10">Rencontrer les artisans</Link>
          </div>
        </div>
      </div>
      <div className="relative">
        <ChiffresMaison sombre />
      </div>
    </section>
  )
}

// Avis clients de l'accueil
export function SectionAvis() {
  const refSection = useRef(null)
  useRevelations(refSection)

  return (
    <section ref={refSection} aria-labelledby="titre-temoignages" className="px-gouttiere py-20 lg:py-28">
      <p data-reveal className="label flex items-center gap-3 text-cuivre">
        <span className="h-px w-10 bg-cuivre" aria-hidden="true" />
        Avis clients · 4,9 / 5
      </p>
      <h2 id="titre-temoignages" data-titre-mots className="mt-6 max-w-3xl text-titre"><MotsReveles texte="Ils vivent avec nos pièces" /></h2>

      <ul className="mt-14 grid grid-cols-1 gap-px border border-sable bg-sable md:grid-cols-3">
        {temoignages.map((temoignage) => (
          <li key={temoignage.nom} data-reveal className="flex flex-col bg-beige p-6 xl:p-10">
            <Note valeur={temoignage.note} />
            <blockquote className="mt-6 flex-1 text-[19px] leading-snug tracking-[-0.01em]">« {temoignage.texte} »</blockquote>
            <p className="label mt-8">
              {temoignage.nom} <span className="text-cuivre">· {temoignage.ville}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

const validerNewsletter = ({ email }) => (estEmailValide(email) ? {} : { email: 'Saisissez une adresse e-mail valide.' })

// Newsletter : en Phase 1, l'inscription est simplement confirmée par un toast
export function SectionNewsletter() {
  const refSection = useRef(null)
  const toast = useToast()
  useRevelations(refSection)

  const { champ, soumettre, setValeurs } = useFormulaire({ email: '' }, validerNewsletter, () => {
    toast('Merci ! Vous recevrez nos nouvelles pièces en avant-première.')
    setValeurs({ email: '' })
  })

  return (
    <section ref={refSection} aria-labelledby="titre-newsletter" className="border-t border-sable bg-beige px-gouttiere py-20 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
        <div>
          <p data-reveal className="label text-cuivre">Newsletter · -10 % sur la première commande</p>
          <h2 id="titre-newsletter" data-titre-mots className="mt-6 text-titre"><MotsReveles texte="Les nouvelles pièces, avant tout le monde." /></h2>
        </div>
        <form data-reveal onSubmit={soumettre} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Champ label="Votre e-mail" type="email" autoComplete="email" placeholder="vous@exemple.ma" className="flex-1" {...champ('email')} />
          <button type="submit" className="btn btn-plein sm:mt-[26px]">S'inscrire</button>
        </form>
      </div>
    </section>
  )
}
