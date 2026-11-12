// Étoile marocaine à 8 branches du logo (deux carrés superposés), redessinée en SVG.
// Motif décoratif du site : séparateur de sections, loader, puce de liste, filigrane.

const BRANCHES = 8
const RAPPORT_CREUX = 0.7654 // rapport exact entre creux et pointes pour deux carrés croisés

function tracerEtoile(rayon, centre = 50) {
  const points = Array.from({ length: BRANCHES * 2 }, (_, position) => {
    const distance = position % 2 === 0 ? rayon : rayon * RAPPORT_CREUX
    const angle = ((position * 180) / BRANCHES - 90) * (Math.PI / 180)
    return `${(centre + distance * Math.cos(angle)).toFixed(2)} ${(centre + distance * Math.sin(angle)).toFixed(2)}`
  })
  return `M${points.join('L')}Z`
}

// Étoile pleine, évidée d'une petite étoile centrale comme sur le logo
const TRACE_ETOILE = `${tracerEtoile(50)} ${tracerEtoile(17)}`

export default function Etoile({ className = 'h-4 w-4', ...reste }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true" className={className} {...reste}>
      <path fillRule="evenodd" d={TRACE_ETOILE} />
    </svg>
  )
}

// Séparateur de sections : filet · étoile · filet
export function SeparateurEtoile({ sombre = false }) {
  const filet = sombre ? 'bg-creme/15' : 'bg-sable'
  return (
    <div className="flex items-center gap-6 px-gouttiere" role="separator">
      <span className={`h-px flex-1 ${filet}`} />
      <Etoile className="h-5 w-5 text-ambre" />
      <span className={`h-px flex-1 ${filet}`} />
    </div>
  )
}

// Filigrane très léger (opacité 5 %) pour les sections sombres ; le parent doit être `relative overflow-hidden`
export function FiligraneEtoile({ className = '-right-32 -top-32 h-[560px] w-[560px]' }) {
  return <Etoile className={`pointer-events-none absolute text-ivoire opacity-5 ${className}`} />
}

// Loader : l'étoile tourne lentement
export function Chargeur({ texte = 'Chargement…' }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4 py-16">
      <Etoile className="h-10 w-10 animate-tourne text-ambre" />
      <span className="label text-cuivre">{texte}</span>
    </div>
  )
}
