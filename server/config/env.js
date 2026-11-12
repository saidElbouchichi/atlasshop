import 'dotenv/config'

// Toute la configuration vient de l'environnement (fichier .env en local, variables Render en production).
// Aucun secret n'est écrit dans le code : voir .env.example.

const liste = (valeur) =>
  String(valeur ?? '')
    .split(',')
    // Sans slash final : l'origine doit correspondre exactement à celle envoyée par le navigateur
    .map((element) => element.trim().replace(/\/+$/, ''))
    .filter(Boolean)

const nombre = (valeur, parDefaut) => {
  const converti = Number(valeur)
  return Number.isFinite(converti) && converti > 0 ? converti : parDefaut
}

const borner = (valeur, min, max) => Math.min(max, Math.max(min, valeur))

// Sans NODE_ENV, on se comporte comme en production : c'est le réglage le plus strict
const nodeEnv = process.env.NODE_ENV ?? 'production'
const ENVIRONNEMENTS_LOCAUX = ['development', 'test']
const local = ENVIRONNEMENTS_LOCAUX.includes(nodeEnv)

const ROUNDS_MIN = 10
const ROUNDS_MAX = 14
const ROUNDS_TEST = 4

export const env = {
  nodeEnv,
  port: nombre(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  // Coût du hash : borné entre 10 et 14 (allégé uniquement pendant les tests)
  bcryptRounds: nodeEnv === 'test' ? ROUNDS_TEST : borner(nombre(process.env.BCRYPT_ROUNDS, ROUNDS_MIN), ROUNDS_MIN, ROUNDS_MAX),
  // Origines autorisées par CORS (frontend Vercel et local), séparées par des virgules
  clientUrls: liste(process.env.CLIENT_URL ?? (local ? 'http://localhost:5173,http://127.0.0.1:5173' : '')),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
}

export const estLocal = () => local
export const estDeveloppement = () => nodeEnv === 'development'
export const estTest = () => nodeEnv === 'test'
export const stripeConfigure = () => Boolean(env.stripeSecretKey)
export const cloudinaryConfigure = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret)

// Le paiement simulé exige DEUX conditions explicites : un environnement local (development ou test)
// et le drapeau ALLOW_FAKE_PAYMENT=true. Il ne peut donc pas s'activer par oubli en production.
export const paiementSimuleAutorise = () => local && process.env.ALLOW_FAKE_PAYMENT === 'true'

const LONGUEUR_MIN_SECRET = 32

// Échoue tôt, avec un message clair, si une variable indispensable manque
export function verifierEnv({ exigerMongo = true } = {}) {
  const manquantes = []
  if (exigerMongo && !env.mongoUri) manquantes.push('MONGO_URI')
  if (!env.jwtSecret) manquantes.push('JWT_SECRET')
  if (env.clientUrls.length === 0) manquantes.push('CLIENT_URL')
  // Sans paiement simulé, Stripe est indispensable : clé secrète et secret du webhook
  if (!paiementSimuleAutorise()) {
    if (!env.stripeSecretKey) manquantes.push('STRIPE_SECRET_KEY')
    if (!env.stripeWebhookSecret) manquantes.push('STRIPE_WEBHOOK_SECRET')
  }
  if (manquantes.length > 0) {
    throw new Error(`Variables d'environnement manquantes : ${manquantes.join(', ')} (voir server/.env.example)`)
  }
  if (env.jwtSecret.length < LONGUEUR_MIN_SECRET) {
    throw new Error(`JWT_SECRET doit compter au moins ${LONGUEUR_MIN_SECRET} caractères`)
  }
}
