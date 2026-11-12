import { randomBytes } from 'node:crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Démo locale sans MongoDB Atlas : npm run dev:memoire
// Lance l'API sur une base MongoDB en mémoire, déjà remplie par le seed.
// Les données sont perdues à l'arrêt. À ne jamais utiliser en production.

const generer = (octets) => randomBytes(octets).toString('base64url')

// Sans .env, un secret JWT et des mots de passe de démo sont générés pour cette session uniquement
process.env.JWT_SECRET ||= generer(48)
const motDePasseAdmin = process.env.SEED_ADMIN_PASSWORD || generer(9)
const motDePasseClient = process.env.SEED_USER_PASSWORD || generer(9)

const { env, estProduction } = await import('../config/env.js')
if (estProduction()) throw new Error('dev:memoire est réservé au développement.')

const { connecterDB } = await import('../config/db.js')
const { creerApp } = await import('../app.js')
const { EMAIL_ADMIN, EMAIL_CLIENT, peupler } = await import('./peupler.js')

const mongo = await MongoMemoryServer.create()
await connecterDB(mongo.getUri())
const resultat = await peupler({ motDePasseAdmin, motDePasseClient })

creerApp().listen(env.port, () => {
  console.info(`API AtlasShop (base en mémoire) sur http://localhost:${env.port}/api`)
  console.info(`${resultat.produits} produits et ${resultat.categories} catégories chargés.`)
  console.info(`Admin  : ${EMAIL_ADMIN} / ${motDePasseAdmin}`)
  console.info(`Client : ${EMAIL_CLIENT} / ${motDePasseClient}`)
})

const arreter = async () => {
  await mongo.stop()
  process.exit(0)
}
process.on('SIGINT', arreter)
process.on('SIGTERM', arreter)
