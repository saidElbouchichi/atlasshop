import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Etoile from '../ui/Etoile'
import Photo from '../ui/Photo'

// Les pièces gravitent comme des planètes autour d'un astre central.
// 1er clic sur une pièce : elle vient au centre et s'ouvre en carte. 2e clic : on entre sur sa fiche.
// La rotation se met en pause au survol pour que les pièces soient faciles à viser.

// Chaque orbite occupe une tranche de la liste des pièces (la position 0 est le centre)
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

export const TAILLE_SYSTEME = 560
const TAILLE_ASTRE = 116
const LARGEUR_CARTE = 152
const apparition = { initial: { scale: 0.5, opacity: 0 }, animate: { scale: 1, opacity: 1 } }
const transition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
const CLASSE_CERCLE =
  'block h-full w-full overflow-hidden rounded-full border-2 border-creme bg-creme transition-[transform,border-color] duration-500 ease-luxe hover:scale-110 hover:border-ambre focus-visible:border-ambre'

function Orbite({ orbite, pieces, surSelection }) {
  const sens = orbite.inverse ? 'reverse' : 'normal'
  const sensContraire = orbite.inverse ? 'normal' : 'reverse'

  return (
    // pointer-events-none : le disque de l'orbite ne doit pas intercepter les clics destinés
    // aux pièces de l'orbite intérieure et à l'astre central
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 animate-tourne rounded-full border border-dashed border-creme/60"
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
              className="group/planete pointer-events-auto relative animate-tourne"
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
              {/* Étiquette au survol : nom de la pièce */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-brun px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-creme opacity-0 transition-opacity duration-300 group-hover/planete:opacity-100"
              >
                {planete.court}
              </span>
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
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: TAILLE_ASTRE, height: TAILLE_ASTRE, marginLeft: -TAILLE_ASTRE / 2, marginTop: -TAILLE_ASTRE / 2 }}
      >
        {/* Halo qui invite au clic */}
        <span className="absolute inset-0 animate-ping rounded-full border border-ambre [animation-duration:2.6s]" aria-hidden="true" />
        <motion.button
          key={`cercle-${astre.slug}`}
          type="button"
          onClick={surOuverture}
          aria-label={`Mettre en avant ${astre.nom}`}
          className={`relative ${CLASSE_CERCLE}`}
          transition={transition}
          {...apparition}
        >
          <Photo image={astre.image} sizes="120px" prioritaire className="h-full w-full object-cover [filter:sepia(0.14)]" />
        </motion.button>
      </div>
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
        className="block rounded border border-sable bg-creme p-2 transition-[transform,border-color] duration-500 ease-luxe hover:scale-105 hover:border-ambre"
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

/**
 * Système orbital (présentation seule) : l'état est tenu par VitrineOrbitale.
 * @param {{ pieces: object[], enCarte: boolean, surSelection: (slug: string) => void, surOuverture: () => void }} props
 */
export default function SystemeOrbital({ pieces, enCarte, surSelection, surOuverture }) {
  const [astre] = pieces

  return (
    <div className="systeme-orbital relative shrink-0" style={{ width: TAILLE_SYSTEME, height: TAILLE_SYSTEME }}>
      {ETOILES.map((etoile) => (
        <Etoile
          key={`${etoile.x}-${etoile.y}`}
          className="pointer-events-none absolute animate-scintille text-ivoire"
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
          surSelection={surSelection}
        />
      ))}

      <AstreCentral astre={astre} enCarte={enCarte} surOuverture={surOuverture} />
    </div>
  )
}
