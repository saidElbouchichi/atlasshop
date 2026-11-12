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
  // L'intro n'est marquée « vue » qu'à la fin de l'écran de chargement : tant qu'il joue, on l'attend
  if (chargementActif && !introDejaVue()) return DUREE_CHARGEMENT
  const premierAffichage = performance.now() < FENETRE_PREMIER_AFFICHAGE_MS
  return premierAffichage ? 0.1 : DUREE_RIDEAU * 0.7
}
