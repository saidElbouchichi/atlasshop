import { useRef } from 'react'
import { useRevelations } from '../../hooks/useRevelations'

const COURBE = 'M0 78 C 300 132, 760 -12, 1440 46'

// Transition entre le hero et la section sombre suivante : la vague du logo
// monte sur le bas du hero et son liseré ambre se dessine au scroll.
export default function TransitionVague() {
  const refVague = useRef(null)
  useRevelations(refVague)

  return (
    <div ref={refVague} aria-hidden="true" className="pointer-events-none relative z-10 -mt-[clamp(44px,7vw,110px)]">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-[clamp(44px,7vw,110px)] w-full overflow-visible"
      >
        <path d={`${COURBE} L1440 121 L0 121 Z`} className="fill-brun" />
        <path
          data-vague
          d={COURBE}
          pathLength="1"
          fill="none"
          className="stroke-ambre"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset="0"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
