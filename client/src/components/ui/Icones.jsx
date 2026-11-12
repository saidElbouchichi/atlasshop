// Icônes au trait fin, dans le langage visuel du site
const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function IconeWhatsApp(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z" />
      <path d="M9.2 8.2c-.3 2.8 2.8 6.3 6.3 6.600l1-1.6-1.8-1-.9.8c-1-.5-1.7-1.3-2.2-2.300l.8-.8-1-1.900z" />
    </svg>
  )
}

export function IconePanier(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6.500a3 3 0 0 1 6 0V8" />
    </svg>
  )
}

export function IconeFleche({ direction = 'droite', ...props }) {
  const rotation = direction === 'gauche' ? 'rotate(180 12 12)' : undefined
  return (
    <svg {...base} {...props}>
      <g transform={rotation}>
        <path d="M4 12h16" />
        <path d="M14 6l6 6-6 6" />
      </g>
    </svg>
  )
}

export function IconeFermer(props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  )
}

export function IconeInstagram(props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M16.6 7.4h.01" />
    </svg>
  )
}

export function IconeFacebook(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V3h-2a4 4 0 0 0-4 4v1.5H9V11h2v10h3V11h2.5l.5-2.5H14z" />
    </svg>
  )
}

export function IconeTikTok(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 4c.3 2.4 1.8 4 4.5 4.3" />
    </svg>
  )
}

export function IconeMain(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 13V6.500a1.5 1.5 0 0 1 3 0V11m0-5.500a1.5 1.5 0 0 1 3 0V11m0-4a1.5 1.5 0 0 1 3 0v7a6 6 0 0 1-6 6h-.5a6 6 0 0 1-5-2.700L4 14.500a1.5 1.5 0 0 1 2.5-1.600L8 14.5" />
    </svg>
  )
}

export function IconeLivraison(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  )
}

export function IconeCadenas(props) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1" />
      <path d="M8 10.500V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  )
}
