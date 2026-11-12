import Category from '../models/Category.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { categories, produits } from './donnees.js'

export const EMAIL_ADMIN = 'admin@atlasshop.ma'
export const EMAIL_CLIENT = 'salma@atlasshop.ma'

/**
 * Vide la base puis insère 1 admin, 1 client, 5 catégories et 20 produits.
 * Les mots de passe sont fournis par l'appelant (jamais écrits dans le code).
 * @param {{ motDePasseAdmin: string, motDePasseClient: string }} options
 */
export async function peupler({ motDePasseAdmin, motDePasseClient }) {
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Category.deleteMany({}), Order.deleteMany({})])

  // create() (et non insertMany) pour passer par les hooks : hash du mot de passe, index de recherche
  const [admin, client] = await User.create([
    { name: 'Admin Atlas', email: EMAIL_ADMIN, password: motDePasseAdmin, role: 'admin' },
    { name: 'Salma Bennani', email: EMAIL_CLIENT, password: motDePasseClient, role: 'user' },
  ])
  await Category.create(categories)
  const produitsCrees = await Product.create(produits)

  return { admin, client, produits: produitsCrees.length, categories: categories.length }
}
