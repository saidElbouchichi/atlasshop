import { creerApp } from './app.js'
import { connecterDB, deconnecterDB } from './config/db.js'
import { env, verifierEnv } from './config/env.js'

// Point d'entrée de production : vérifie la configuration, connecte MongoDB Atlas, puis écoute
async function demarrer() {
  verifierEnv()
  await connecterDB(env.mongoUri)
  const serveur = creerApp().listen(env.port, () => {
    console.info(`API AtlasShop en écoute sur le port ${env.port} (${env.nodeEnv})`)
  })

  const arreter = async () => {
    serveur.close()
    await deconnecterDB()
    process.exit(0)
  }
  process.on('SIGTERM', arreter)
  process.on('SIGINT', arreter)
}

demarrer().catch((erreur) => {
  console.error('Démarrage impossible :', erreur.message)
  process.exit(1)
})
