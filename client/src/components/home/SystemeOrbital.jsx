import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { deuxChiffres } from '../../utils/format'
import Etoile from '../ui/Etoile'
import Photo from '../ui/Photo'

// Les pièces gravitent comme des planètes autour d'un astre central.
// 1er clic sur une pièce : elle vient au centre et s'ouvre en carte. 2e clic : on entre sur sa fiche.

const piece = (slug, nom, court, id) => ({ slug, nom, court, image: { id, alt: nom } })

// L'ordre de départ : la première pièce est au centre, les suivantes sur les orbites
const PIECES = [
  piece('amphore-zagora', 'Amphore Zagora', 'Zagora', '1618722060945-b87f7326995b'),
  piece('bol-safi-emaille', 'Bol Safi émaillé', 'Bol Safi', '1552740844-4f8a8206c68d'),
  piece('huile-argan-pure', "Huile d'argan pure", 'Argan', '1608571423539-e951b9b3871e'),
  piece('besace-medina', 'Besace Médina', 'Besace', '1600857062241-98e5dba7f214'),
  piece('tajine-de-sale', 'Tajine de Salé', 'Tajine', '1706793986649-5c6516491489'),
  piece('tapis-azilal-soleil', 'Tapis Azilal Soleil', 'Azilal', '1677285193302-3d088cd0a342'),
  piece('pouf-tan', 'Pouf Tan', 'Pouf Tan', '1690618299438-cb453b14bab3'),
  piece('lanterne-fassia', 'Lanterne Fassia', 'Lanterne', '1778486897678-b0bd710edf5a'),
].map((element, position) => ({ ...element, numero: deuxChiffres(position + 1) }))

// Chaque orbite occupe une tranche de la liste (la position 0 est le centre)
const ORBITES = [
  { rayon: 150, duree: 38, debut: 1, fin: 4, tailles: [64, 58, 68] },
  { rayon: 238, duree: 64, debut: 4, fin: 8, tailles: [76, 84, 68, 62], inverse: true },
]

// Étoiles à 8 branches qui scintillent autour du système (positions en % du cadre)
const ETOILES = [
  { x: 6, y: 14, taille: 14, delai: 0 },
  { x: 90, y: 8, taille: 10, delai: 1.2 },
  { x: 96, y: 58, taille: 16, delai: 0.6 },
  { x: 14, y: 88, taille: 12, delai: 1.8 },
  { x: 70, y: 94, taille: 9, delai: 2.4 },
  { x: 2, y: 52, taille: 9, delai: 3 },
  { x: 48, y: 2, taille: 11, delai: 0.9 },
]

const TAILLE_SYSTEME = 560
const TAILLE_ASTRE = 116
const LARGEUR_CARTE = 152
const apparition = { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 } }
const transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
const CLASSE_CERCLE =
  'block h-full w-full overflow-hidden rounded-full border-2 border-creme bg-creme transition-transform duration-500 ease-luxe hover:scale-110'

function Orbite({ orbite, pieces, surSelection }) {
  const sens = orbite.inverse ? 'reverse' : 'normal'
  const sensContraire = orbite.inverse ? 'normal' : 'reverse'

  return (
    <div
      className="absolute left-1/2 top-1/2 animate-tourne rounded-full border border-dashed border-creme/60"
      style={{
        width: orbite.rayon * 2,
        height: orbite.rayon * 2,
        marginLeft: -orbite.rayon,
        marginTop: -orbite.rayon,
        animationDuration: `${orbite.duree}s`,
        animationDirection: sens,
      }}
    >
      {pieces.map((planete, position) => {
        const angle = (360 / pieces.length) * position
        const taille = orbite.tailles[position]
        return (
          <div
            // La clé suit l'emplacement : quand deux pièces s'échangent, seul le contenu change
            key={position}
            className="absolute left-1/2 top-1/2"
            // On place la planète sur l'orbite, puis on annule l'angle pour qu'elle reste droite
            style={{ transform: `rotate(${angle}deg) translateX(${orbite.rayon}px) rotate(${-angle}deg)` }}
          >
            {/* Contre-rotation : la photo ne tourne pas sur elle-même pendant que l'orbite tourne */}
            <div
              className="animate-tourne"
              style={{
                width: taille,
                height: taille,
                marginLeft: -taille / 2,
                marginTop: -taille / 2,
                animationDuration: `${orbite.duree}s`,
                animationDirection: sensContraire,
              }}
            >
              <motion.button
                key={planete.slug}
                type="button"
                onClick={() => surSelection(planete.slug)}
                aria-label={`Mettre en avant ${planete.nom}`}
                className={CLASSE_CERCLE}
                transition={transition}
                {...apparition}
              >
                <Photo image={planete.image} sizes="96px" className="h-full w-full object-cover [filter:sepia(0.14)]" />
              </motion.button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// L'astre central : un cercle comme les autres, qui s'ouvre en carte au premier clic
function AstreCentral({ astre, enCarte, surOuverture }) {
  if (!enCarte) {
    return (
      <motion.button
        key={`cercle-${astre.slug}`}
        type="button"
        onClick={surOuverture}
        aria-label={`Mettre en avant ${astre.nom}`}
        className={`absolute left-1/2 top-1/2 ${CLASSE_CERCLE}`}
        style={{ width: TAILLE_ASTRE, height: TAILLE_ASTRE, marginLeft: -TAILLE_ASTRE / 2, marginTop: -TAILLE_ASTRE / 2 }}
        transition={transition}
        {...apparition}
      >
        <Photo image={astre.image} sizes="120px" prioritaire className="h-full w-full object-cover [filter:sepia(0.14)]" />
      </motion.button>
    )
  }

  return (
    <motion.div
      key={`carte-${astre.slug}`}
      className="absolute left-1/2 top-1/2"
      style={{ width: LARGEUR_CARTE, marginLeft: -LARGEUR_CARTE / 2, marginTop: -112 }}
      transition={transition}
      {...apparition}
    >
      <Link
        to={`/produit/${astre.slug}`}
        aria-label={`Voir la fiche de ${astre.nom}`}
        className="block rounded border border-sable bg-creme p-2 transition-transform duration-500 ease-luxe hover:scale-105"
      >
        <Photo image={astre.image} sizes="160px" className="aspect-[4/5] w-full rounded object-cover [filter:sepia(0.14)]" />
        <span className="mt-2 flex justify-between gap-2 px-1 text-mini font-medium uppercase">
          <span>{astre.court}</span>
          <span className="text-ambre">N° {astre.numero}</span>
        </span>
        <span className="mt-1 block px-1 pb-1 text-[9px] uppercase tracking-[0.14em] text-cuivre">Voir la fiche →</span>
      </Link>
    </motion.div>
  )
}

export default function SystemeOrbital() {
  const [pieces, setPieces] = useState(PIECES)
  const [enCarte, setEnCarte] = useState(false)
  const [astre] = pieces

  // La pièce choisie échange sa place avec l'astre central et s'ouvre en carte
  const selectionner = (slug) => {
    setPieces((actuelles) => {
      const position = actuelles.findIndex((element) => element.slug === slug)
      if (position <= 0) return actuelles
      const suivantes = [...actuelles]
      suivantes[0] = actuelles[position]
      suivantes[position] = actuelles[0]
      return suivantes
    })
    setEnCarte(true)
  }

  return (
    <div className="relative shrink-0" style={{ width: TAILLE_SYSTEME, height: TAILLE_SYSTEME }}>
      {ETOILES.map((etoile) => (
        <Etoile
          key={`${etoile.x}-${etoile.y}`}
          className="absolute animate-scintille text-ivoire"
          style={{
            left: `${etoile.x}%`,
            top: `${etoile.y}%`,
            width: etoile.taille,
            height: etoile.taille,
            animationDelay: `${etoile.delai}s`,
          }}
        />
      ))}

      {ORBITES.map((orbite) => (
        <Orbite
          key={orbite.rayon}
          orbite={orbite}
          pieces={pieces.slice(orbite.debut, orbite.fin)}
          surSelection={selectionner}
        />
      ))}

      <AstreCentral astre={astre} enCarte={enCarte} surOuverture={() => setEnCarte(true)} />
    </div>
  )
}
