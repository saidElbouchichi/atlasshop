// La vague ambre du logo, redessinée en SVG.
// Elle souligne les mots forts des titres : le trait se dessine (stroke-dashoffset)
// quand l'élément est révélé — voir `data-vague` dans useRevelations.

export const TRACE_VAGUE = 'M3 15 C 48 23, 104 1, 197 8'
export const BOITE_VAGUE = '0 0 200 24'

export function SoulignementVague({ className = '' }) {
  return (
    <svg
      viewBox={BOITE_VAGUE}
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 -bottom-[0.14em] h-[0.2em] w-full overflow-visible ${className}`}
    >
      <path
        data-vague
        d={TRACE_VAGUE}
        pathLength="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1"
        strokeDashoffset="0"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// Mot mis en avant dans un titre : couleur ambre + vague dessinée dessous
export function MotVague({ children }) {
  return (
    <span className="relative inline-block text-ambre">
      {children}
      <SoulignementVague />
    </span>
  )
}
