import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useDefilementDepasse } from '../../hooks/useDefilementDepasse'
import { selectNombreArticles } from '../../store/slices/cartSlice'
import { ouvrirMenu, ouvrirPanier } from '../../store/slices/uiSlice'
import { lienWhatsApp } from '../../utils/whatsapp'
import { IconePanier, IconeWhatsApp } from '../ui/Icones'

// Header fin et fixe : MENU à gauche, logo + « ATLASSHOP » au centre, WhatsApp et panier à droite.
// Au scroll, le header se réduit et le logo passe de 40 à 32 px.
export default function Header() {
  const dispatch = useDispatch()
  const nombreArticles = useSelector(selectNombreArticles)
  const reduit = useDefilementDepasse()

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b border-sable bg-creme/90 backdrop-blur-md transition-[height] duration-500 ease-luxe ${
        reduit ? 'h-14' : 'h-entete'
      }`}
    >
      <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center px-gouttiere">
        <button
          type="button"
          onClick={() => dispatch(ouvrirMenu())}
          aria-haspopup="dialog"
          className="label h-10 justify-self-start rounded border border-brun px-4 transition-colors duration-300 hover:border-ambre hover:bg-ambre"
        >
          Menu
        </button>

        <Link to="/" aria-label="AtlasShop — retour à l'accueil" className="flex items-center gap-3">
          <img
            src="/logo-marque.webp"
            alt=""
            width="63"
            height="40"
            className={`w-auto transition-[height] duration-500 ease-luxe ${reduit ? 'h-8' : 'h-10'}`}
          />
          <span className="hidden pl-[0.2em] text-[15px] font-medium uppercase tracking-logo sm:block">
            AtlasShop
          </span>
        </Link>

        <div className="flex items-center gap-2 justify-self-end">
          <a
            href={lienWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Nous écrire sur WhatsApp"
            className="case-icone"
          >
            <IconeWhatsApp />
          </a>
          <button
            type="button"
            onClick={() => dispatch(ouvrirPanier())}
            aria-label={`Ouvrir le panier (${nombreArticles} article${nombreArticles > 1 ? 's' : ''})`}
            aria-haspopup="dialog"
            className="case-icone"
          >
            <IconePanier />
            <span
              aria-hidden="true"
              className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brun px-1 text-[10px] font-medium leading-none text-creme"
            >
              {nombreArticles}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
