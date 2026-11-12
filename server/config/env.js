import 'dotenv/config'

// Toute la configuration vient de l'environnement (fichier .env en local, variables Render en production).
// Aucun secret n'est écrit dans le code : voir .env.example.

const liste = (valeur) =>
  String(valeur ?? '')
    .split(',')
    .map((element) => element.trim())
    .filter(Boolean)

const nombre = (valeur, parDefaut) => {
  const converti = Number(valeur)
  return Number.isFinite(converti) && converti > 0 ? converti : parDefaut
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: nombre(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  bcryptRounds: nombre(process.env.BCRYPT_ROUNDS, 10),
  // Origines autorisées par CORS (frontend Vercel et local), séparées par des virgules
  clientUrls: liste(process.env.CLIENT_URL ?? 'http://localhost:5173,http://127.0.0.1:5173'),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
}

export const estProduction = () => env.nodeEnv === 'production'
export const estTest = () => env.nodeEnv === 'test'
export const stripeConfigure = () => Boolean(env.stripeSecretKey)
export const cloudinaryConfigure = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret)

const LONGUEUR_MIN_SECRET = 32

// Échoue tôt, avec un message clair, si une variable indispensable manque
export function verifierEnv({ exigerMongo = true } = {}) {
  const manquantes = []
  if (exigerMongo && !env.mongoUri) manquantes.push('MONGO_URI')
  if (!env.jwtSecret) manquantes.push('JWT_SECRET')
  if (manquantes.length > 0) {
    throw new Error(`Variables d'environnement manquantes : ${manquantes.join(', ')} (voir server/.env.example)`)
  }
  if (env.jwtSecret.length < LONGUEUR_MIN_SECRET) {
    throw new Error(`JWT_SECRET doit compter au moins ${LONGUEUR_MIN_SECRET} caractères`)
  }
  if (estProduction() && !stripeConfigure()) {
    throw new Error('STRIPE_SECRET_KEY est obligatoire en production')
  }
}
