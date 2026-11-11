/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Palette AtlasShop : uniquement des tons chauds, jamais de bleu ni de gris froid
      colors: {
        creme: '#F5EFE6',
        beige: '#EFE6D8',
        brun: '#27221A',
        ambre: '#D2942D',
        sable: '#D9CDBB',
        taupe: '#8A7A66',
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        mini: ['10px', { lineHeight: '1.4', letterSpacing: '0.16em' }],
        label: ['11px', { lineHeight: '1.6', letterSpacing: '0.18em' }],
        hero: ['clamp(46px, 7vw, 120px)', { lineHeight: '0.95', letterSpacing: '-0.045em' }],
        titre: ['clamp(40px, 5.4vw, 88px)', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
        'sous-titre': ['clamp(28px, 3vw, 44px)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
      },
      letterSpacing: {
        label: '0.18em',
        logo: '0.42em',
      },
      spacing: {
        gouttiere: 'clamp(20px, 4vw, 64px)',
        entete: '64px',
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      transitionTimingFunction: {
        luxe: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        defile: { to: { transform: 'translateX(-50%)' } },
        tourne: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        defile: 'defile 36s linear infinite',
        tourne: 'tourne 22s linear infinite',
      },
    },
  },
  plugins: [],
}
