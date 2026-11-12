// Génère les déclinaisons du logo à partir de public/logo.png :
// logo du header, logo clair du footer, favicons, icônes du manifest et image Open Graph.
// Usage : npm run identite
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const DOSSIER_PUBLIC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public')
const SOURCE = path.join(DOSSIER_PUBLIC, 'logo.png')

const CREME = { r: 245, g: 239, b: 230 } // #F5EFE6, fond de page
const IVOIRE = { r: 252, g: 232, b: 202 } // #FCE8CA, crème du logo
const BRUN = { r: 42, g: 21, b: 9 } // #2A1509, brun du logo
const SEUIL_ALPHA = 128

const sortie = (nom) => path.join(DOSSIER_PUBLIC, nom)

// Recadre le logo sur ses pixels visibles (le fichier source a de larges marges transparentes)
async function recadrerLogo() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let gauche = info.width
  let haut = info.height
  let droite = 0
  let bas = 0
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] <= SEUIL_ALPHA) continue
      gauche = Math.min(gauche, x)
      droite = Math.max(droite, x)
      haut = Math.min(haut, y)
      bas = Math.max(bas, y)
    }
  }
  const zone = { left: gauche, top: haut, width: droite - gauche + 1, height: bas - haut + 1 }
  return sharp(SOURCE).extract(zone).png().toBuffer()
}

const estOrange = (r, g, b) => r > 190 && g > 90 && g < 200 && b < 120 && r - b > 100
const melanger = (debut, fin, t) => Math.round(debut + (fin - debut) * t)

// Version claire pour fond sombre : le brun devient ivoire, le crème devient brun, l'ambre est conservé
async function eclaircirLogo(logo) {
  const { data, info } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = Buffer.from(data)
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]]
    if (estOrange(r, g, b)) continue
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    const t = Math.min(1, Math.max(0, (luminance - 0.12) / 0.73))
    pixels[i] = melanger(IVOIRE.r, BRUN.r, t)
    pixels[i + 1] = melanger(IVOIRE.g, BRUN.g, t)
    pixels[i + 2] = melanger(IVOIRE.b, BRUN.b, t)
  }
  return sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

// Icône carrée : logo centré avec une marge, sur fond transparent ou crème
async function creerIcone(logo, taille, { fond = null, marge = 0.08 } = {}) {
  const cote = Math.round(taille * (1 - marge * 2))
  const contenu = await sharp(logo)
    .resize(cote, cote, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  const arrierePlan = fond ? { ...fond, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 }
  return sharp({ create: { width: taille, height: taille, channels: 4, background: arrierePlan } })
    .composite([{ input: contenu, gravity: 'centre' }])
    .png()
    .toBuffer()
}

async function creerImageOpenGraph(logo) {
  const LARGEUR = 1200
  const HAUTEUR = 630
  const logoRedimensionne = await sharp(logo).resize({ height: 300 }).toBuffer()
  const { width: largeurLogo } = await sharp(logoRedimensionne).metadata()
  const texte = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}">
      <rect x="24" y="24" width="${LARGEUR - 48}" height="${HAUTEUR - 48}" fill="none" stroke="#D9CDBB" stroke-width="2"/>
      <text x="600" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34"
        letter-spacing="16" fill="#2A1509">ATLASSHOP</text>
      <text x="600" y="540" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="44"
        fill="#2A1509">L'artisanat marocain, chez vous</text>
    </svg>`)
  return sharp({ create: { width: LARGEUR, height: HAUTEUR, channels: 4, background: { ...CREME, alpha: 1 } } })
    .composite([
      { input: logoRedimensionne, left: Math.round((LARGEUR - largeurLogo) / 2), top: 80 },
      { input: texte, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

async function generer() {
  const logo = await recadrerLogo()
  const logoClair = await eclaircirLogo(logo)

  const fichiers = [
    ['logo-marque.webp', await sharp(logo).resize({ height: 240 }).webp({ quality: 90 }).toBuffer()],
    ['logo-clair.webp', await sharp(logoClair).resize({ height: 480 }).webp({ quality: 90 }).toBuffer()],
    ['favicon-16.png', await creerIcone(logo, 16, { marge: 0 })],
    ['favicon-32.png', await creerIcone(logo, 32, { marge: 0 })],
    ['apple-touch-icon.png', await creerIcone(logo, 180, { fond: CREME, marge: 0.12 })],
    ['icone-192.png', await creerIcone(logo, 192, { fond: CREME, marge: 0.12 })],
    ['icone-512.png', await creerIcone(logo, 512, { fond: CREME, marge: 0.12 })],
    ['og-image.png', await creerImageOpenGraph(logo)],
  ]

  await Promise.all(fichiers.map(([nom, contenu]) => sharp(contenu).toFile(sortie(nom))))
  fichiers.forEach(([nom, contenu]) => process.stdout.write(`${nom} · ${Math.round(contenu.length / 1024)} Ko\n`))
}

generer().catch((erreur) => {
  process.stderr.write(`Échec de la génération : ${erreur.message}\n`)
  process.exitCode = 1
})
