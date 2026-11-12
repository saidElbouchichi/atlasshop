// Coordination des animations d'entrée : écran de chargement (premier affichage),
// rideau de transition entre pages, puis intro du hero.

export const DUREE_RIDEAU = 0.75 // rideau ambre entre deux pages (secondes)
export const DUREE_CHARGEMENT = 2.4 // logo + vague, avant l'ouverture du rideau crème
export const DUREE_OUVERTURE = 0.9 // ouverture du rideau crème

const CLE_SESSION = 'atlasshop_intro_vue'
const FENETRE_PREMIER_AFFICHAGE_MS = 1000
const MOUVEMENT_REDUIT = '(prefers-reduced-motion: reduce)'

function introDejaVue() {
  try {
    return sessionStorage.getItem(CLE_SESSION) === '1'
  } catch {
    return false
  }
}

function calculerChargementActif() {
  if (typeof window === 'undefined') return false
  return !window.matchMedia(MOUVEMENT_REDUIT).matches && !introDejaVue()
}

// Calculé une seule fois : l'écran de chargement ne joue qu'au premier affichage de la session
export const chargementActif = calculerChargementActif()

export function marquerIntroVue() {
  try {
    sessionStorage.setItem(CLE_SESSION, '1')
  } catch {
    // Stockage indisponible : l'intro rejouera au prochain chargement, sans conséquence
  }
}

// Délai (en secondes) avant de lancer l'intro d'une page, selon ce qui la recouvre à cet instant
export function delaiIntro() {
  const premierAffichage = performance.now() < FENETRE_PREMIER_AFFICHAGE_MS
  if (!premierAffichage) return DUREE_RIDEAU * 0.7
  return chargementActif ? DUREE_CHARGEMENT : 0.1
}
