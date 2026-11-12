import { connecterDB, deconnecterDB } from '../config/db.js'
import { env } from '../config/env.js'
import { EMAIL_ADMIN, EMAIL_CLIENT, peupler } from './peupler.js'

// Script seed : npm run seed
// ATTENTION : vide les collections avant de les remplir.

const LONGUEUR_MIN = 8
const LONGUEUR_MIN_SECRET = 32
const BASE_LOCALE = /^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//

async function lancer() {
  if (!env.mongoUri) throw new Error('MONGO_URI est requis (voir .env.example)')
  if (env.jwtSecret.length < LONGUEUR_MIN_SECRET) throw new Error('JWT_SECRET est requis (32 caractères minimum)')
  const motDePasseAdmin = process.env.SEED_ADMIN_PASSWORD ?? ''
  const motDePasseClient = process.env.SEED_USER_PASSWORD ?? ''

  if (motDePasseAdmin.length < LONGUEUR_MIN || motDePasseClient.length < LONGUEUR_MIN) {
    throw new Error(`SEED_ADMIN_PASSWORD et SEED_USER_PASSWORD doivent compter au moins ${LONGUEUR_MIN} caractères (voir .env.example)`)
  }
  // Garde-fou : le seed EFFACE les collections. Sur une base distante (Atlas), il faut le confirmer.
  if (!BASE_LOCALE.test(env.mongoUri) && process.env.SEED_FORCE !== 'true') {
    throw new Error('Cette base n’est pas locale : le seed effacerait ses données. Relancez avec SEED_FORCE=true pour confirmer.')
  }

  const connexion = await connecterDB(env.mongoUri)
  console.info(`Base « ${connexion.name} » : effacement puis remplissage…`)
  const resultat = await peupler({ motDePasseAdmin, motDePasseClient })
  console.info(`Seed terminé : ${resultat.produits} produits, ${resultat.categories} catégories.`)
  console.info(`Comptes : ${EMAIL_ADMIN} (admin) et ${EMAIL_CLIENT} (client), mots de passe définis dans .env.`)
  await deconnecterDB()
}

lancer().catch(async (erreur) => {
  console.error('Seed impossible :', erreur.message)
  await deconnecterDB()
  process.exit(1)
})
