import mongoose from 'mongoose'

// Connexion à MongoDB (Atlas en production, base en mémoire pour les tests et la démo locale)
export async function connecterDB(uri) {
  mongoose.set('strictQuery', true)
  // sanitizeFilter : neutralise les opérateurs ($gt, $ne…) injectés dans les filtres de requête
  mongoose.set('sanitizeFilter', true)
  const connexion = await mongoose.connect(uri)
  return connexion.connection
}

export async function deconnecterDB() {
  await mongoose.disconnect()
}
