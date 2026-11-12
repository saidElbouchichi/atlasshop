import { useEffect, useState } from 'react'

// Indique si la page a défilé au-delà d'un seuil (en pixels)
export function useDefilementDepasse(seuil = 40) {
  const [depasse, setDepasse] = useState(false)

  useEffect(() => {
    const mesurer = () => setDepasse(window.scrollY > seuil)
    mesurer()
    window.addEventListener('scroll', mesurer, { passive: true })
    return () => window.removeEventListener('scroll', mesurer)
  }, [seuil])

  return depasse
}
