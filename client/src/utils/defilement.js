// Accès partagé à l'instance Lenis (smooth scroll) pour la piloter
// depuis les overlays (menu, tiroir panier) et les transitions de page.
let lenis = null

export function definirLenis(instance) {
  lenis = instance
}

export function bloquerDefilement() {
  lenis?.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function debloquerDefilement() {
  lenis?.start()
  document.documentElement.style.overflow = ''
}

// Remontée douce (bouton « retour en haut »)
export function defilerEnHaut() {
  if (lenis) {
    lenis.scrollTo(0, { duration: 1.4 })
    return
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function revenirEnHaut() {
  if (lenis) {
    lenis.scrollTo(0, { immediate: true, force: true })
    return
  }
  window.scrollTo(0, 0)
}
