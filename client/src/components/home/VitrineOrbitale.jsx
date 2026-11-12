import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useAjoutPanier } from '../../hooks/useAjoutPanier'
import { selectProduits } from '../../store/slices/productsSlice'
import { deuxChiffres, formaterPrix } from '../../utils/format'
import { IconeFleche, IconePanier } from '../ui/Icones'
import SystemeOrbital from './SystemeOrbital'

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

const CLASSE_FLECHE =
  'flex h-9 w-9 items-center justify-center rounded-full border border-sable transition-colors duration-300 hover:border-brun'

// Panneau d'information de la pièce au centre : nom, prix, navigation et actions
function PanneauPiece({ astre, enCarte, surPrecedente, surSuivante }) {
  const ajouter = useAjoutPanier()
  const produit = useSelector(selectProduits).find((element) => element.slug === astre.slug)
  const disponible = Boolean(produit && produit.stock > 0)

  return (
    // En bas de la photo sur mobile, en haut à gauche sur grand écran (toujours visible sans défiler)
    <div
      data-hero-fondu
      className="absolute inset-x-4 bottom-[clamp(56px,8vw,124px)] z-20 mx-auto max-w-[360px] rounded border border-sable bg-creme/95 p-4 backdrop-blur lg:bottom-auto lg:left-6 lg:right-auto lg:top-6 lg:mx-0 lg:w-[300px] 2xl:w-[340px]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0" aria-live="polite">
          <p className="label text-cuivre">
            Pièce N° {astre.numero} / {deuxChiffres(PIECES.length)}
          </p>
          <p className="mt-1 truncate text-[20px] leading-tight tracking-[-0.02em]">{astre.nom}</p>
          {produit && <p className="text-ambre">{formaterPrix(produit.price)}</p>}
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button type="button" onClick={surPrecedente} aria-label="Pièce précédente" className={CLASSE_FLECHE}>
            <IconeFleche direction="gauche" width={14} height={14} />
          </button>
          <button type="button" onClick={surSuivante} aria-label="Pièce suivante" className={CLASSE_FLECHE}>
            <IconeFleche width={14} height={14} />
          </button>
        </div>
      </div>

      {enCarte ? (
        <div className="mt-3 flex gap-2">
          <Link to={`/produit/${astre.slug}`} className="btn btn-plein h-10 flex-1 px-3">
            Voir la fiche
          </Link>
          <button
            type="button"
            onClick={() => ajouter(produit)}
            disabled={!disponible}
            aria-label={`Ajouter ${astre.nom} au panier`}
            className="btn btn-contour h-10 px-3 disabled:opacity-40"
          >
            <IconePanier width={16} height={16} />
          </button>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-brun/80">Cliquez sur une pièce pour la découvrir, puis une seconde fois pour entrer.</p>
      )}
    </div>
  )
}

// Vitrine du hero : le système orbital et son panneau d'information.
// Les attributs data-hero-* et data-profondeur sont animés par le Hero (intro et parallaxe).
export default function VitrineOrbitale() {
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

  // Les flèches parcourent les pièces dans l'ordre de leur numéro
  const decaler = (pas) => {
    const rang = PIECES.findIndex((element) => element.slug === astre.slug)
    selectionner(PIECES[(rang + pas + PIECES.length) % PIECES.length].slug)
  }

  return (
    <>
      <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden pb-[clamp(90px,12vw,150px)] lg:pb-0 lg:pt-[120px]">
        <div data-hero-flottant>
          <div data-profondeur="30">
            <div className="scale-[0.56] sm:scale-75 xl:scale-90 2xl:scale-100">
              <SystemeOrbital pieces={pieces} enCarte={enCarte} surSelection={selectionner} surOuverture={() => setEnCarte(true)} />
            </div>
          </div>
        </div>
      </div>

      <PanneauPiece astre={astre} enCarte={enCarte} surPrecedente={() => decaler(-1)} surSuivante={() => decaler(1)} />
    </>
  )
}
