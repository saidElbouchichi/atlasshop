import { Link } from 'react-router-dom'
import Etoile from '../ui/Etoile'
import Photo from '../ui/Photo'

// Les pièces gravitent autour de l'amphore Zagora comme des planètes autour d'un astre.
const ASTRE = {
  slug: 'amphore-zagora',
  nom: 'Amphore Zagora',
  image: { id: '1618722060945-b87f7326995b', alt: 'Amphore en terre cuite tournée à la main' },
}

const planete = (slug, nom, id, taille) => ({ slug, nom, taille, image: { id, alt: nom } })

const ORBITES = [
  {
    rayon: 150,
    duree: 38,
    planetes: [
      planete('bol-safi-emaille', 'Bol Safi émaillé', '1552740844-4f8a8206c68d', 64),
      planete('huile-argan-pure', "Huile d'argan pure", '1608571423539-e951b9b3871e', 56),
      planete('besace-medina', 'Besace Médina', '1600857062241-98e5dba7f214', 68),
    ],
  },
  {
    rayon: 238,
    duree: 64,
    inverse: true,
    planetes: [
      planete('tajine-de-sale', 'Tajine de Salé', '1706793986649-5c6516491489', 76),
      planete('tapis-azilal-soleil', 'Tapis Azilal Soleil', '1677285193302-3d088cd0a342', 84),
      planete('pouf-tan', 'Pouf Tan', '1690618299438-cb453b14bab3', 68),
      planete('lanterne-fassia', 'Lanterne Fassia', '1778486897678-b0bd710edf5a', 60),
    ],
  },
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

function Orbite({ orbite }) {
  const sens = orbite.inverse ? 'reverse' : 'normal'
  const sensContraire = orbite.inverse ? 'normal' : 'reverse'
  const diametre = orbite.rayon * 2

  return (
    <div
      className="absolute left-1/2 top-1/2 animate-tourne rounded-full border border-dashed border-creme/60"
      style={{
        width: diametre,
        height: diametre,
        marginLeft: -orbite.rayon,
        marginTop: -orbite.rayon,
        animationDuration: `${orbite.duree}s`,
        animationDirection: sens,
      }}
    >
      {orbite.planetes.map((astre, position) => {
        const angle = (360 / orbite.planetes.length) * position
        return (
          <div
            key={astre.slug}
            className="absolute left-1/2 top-1/2"
            // On place la planète sur l'orbite, puis on annule l'angle pour qu'elle reste droite
            style={{ transform: `rotate(${angle}deg) translateX(${orbite.rayon}px) rotate(${-angle}deg)` }}
          >
            {/* Contre-rotation : la photo ne tourne pas sur elle-même pendant que l'orbite tourne */}
            <div
              className="animate-tourne"
              style={{
                width: astre.taille,
                height: astre.taille,
                marginLeft: -astre.taille / 2,
                marginTop: -astre.taille / 2,
                animationDuration: `${orbite.duree}s`,
                animationDirection: sensContraire,
              }}
            >
              <Link
                to={`/produit/${astre.slug}`}
                aria-label={`Voir ${astre.nom}`}
                className="block h-full w-full overflow-hidden rounded-full border-2 border-creme bg-creme transition-transform duration-500 ease-luxe hover:scale-125"
              >
                <Photo image={astre.image} sizes="96px" className="h-full w-full object-cover [filter:sepia(0.14)]" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function SystemeOrbital() {
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
        <Orbite key={orbite.rayon} orbite={orbite} />
      ))}

      {/* L'astre central : l'amphore Zagora */}
      <Link
        to={`/produit/${ASTRE.slug}`}
        className="absolute left-1/2 top-1/2 -ml-[76px] -mt-[104px] block w-[152px] rounded border border-sable bg-creme p-2 transition-transform duration-500 ease-luxe hover:scale-105"
      >
        <Photo image={ASTRE.image} sizes="160px" prioritaire className="aspect-[4/5] w-full rounded object-cover" />
        <span className="mt-2 flex justify-between px-1 pb-1 text-mini font-medium uppercase">
          <span>Zagora</span>
          <span className="text-ambre">N° 04</span>
        </span>
      </Link>
    </div>
  )
}
