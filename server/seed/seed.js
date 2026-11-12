import { connecterDB, deconnecterDB } from '../config/db.js'
import { env, estProduction, verifierEnv } from '../config/env.js'
import { EMAIL_ADMIN, EMAIL_CLIENT, peupler } from './peupler.js'

// Script seed : npm run seed
// ATTENTION : vide les collections avant de les remplir.

const LONGUEUR_MIN = 8

async function lancer() {
  verifierEnv()
  const motDePasseAdmin = process.env.SEED_ADMIN_PASSWORD ?? ''
  const motDePasseClient = process.env.SEED_USER_PASSWORD ?? ''

  if (motDePasseAdmin.length < LONGUEUR_MIN || motDePasseClient.length < LONGUEUR_MIN) {
    throw new Error(`SEED_ADMIN_PASSWORD et SEED_USER_PASSWORD doivent compter au moins ${LONGUEUR_MIN} caractères (voir .env.example)`)
  }
  // Garde-fou : en production, le seed efface les vraies données ; il faut le demander explicitement
  if (estProduction() && process.env.SEED_FORCE !== 'true') {
    throw new Error('Seed refusé en production. Ajoutez SEED_FORCE=true pour confirmer l’effacement des données.')
  }

  await connecterDB(env.mongoUri)
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
