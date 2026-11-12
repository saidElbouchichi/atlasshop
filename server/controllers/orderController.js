import mongoose from 'mongoose'
import Order, { STATUTS_COMMANDE } from '../models/Order.js'
import Product from '../models/Product.js'
import { ErreurHttp, asyncHandler, calculerTotaux, envoyer } from '../utils/outils.js'

const NOMBRE_MAX_ADRESSES = 5

// Marque une commande comme payée et décrémente les stocks (appelé par le webhook Stripe)
export async function marquerPayee(commande) {
  if (commande.isPaid) return commande
  await Promise.all(
    commande.items.map((article) =>
      // Le stock ne descend jamais sous zéro
      Product.updateOne({ _id: article.product, stock: mongoose.trusted({ $gte: article.qty }) }, { $inc: { stock: -article.qty } }),
    ),
  )
  commande.isPaid = true
  commande.paidAt = new Date()
  commande.status = 'payée'
  return commande.save()
}

// POST /api/orders — les prix et les noms viennent de la base, jamais de la requête
export const creerCommande = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body
  const produits = await Product.find({ _id: mongoose.trusted({ $in: items.map((article) => String(article.product)) }) })
  const parId = new Map(produits.map((produit) => [produit._id.toString(), produit]))

  const articles = items.map(({ product, qty }) => {
    const produit = parId.get(String(product))
    if (!produit) throw new ErreurHttp(400, 'Un produit du panier n’existe plus.')
    if (produit.stock < qty) throw new ErreurHttp(409, `Stock insuffisant pour « ${produit.name} ».`)
    return { product: produit._id, name: produit.name, image: produit.images[0] ?? null, price: produit.price, qty }
  })

  const commande = await Order.create({
    user: req.user._id,
    items: articles,
    shippingAddress,
    ...calculerTotaux(articles),
  })

  // L'adresse est mémorisée sur le compte (sans doublon, les plus récentes d'abord)
  const dejaConnue = req.user.addresses.some(
    (adresse) => adresse.address === shippingAddress.address && adresse.postalCode === shippingAddress.postalCode,
  )
  if (!dejaConnue) {
    req.user.addresses = [shippingAddress, ...req.user.addresses].slice(0, NOMBRE_MAX_ADRESSES)
    await req.user.save()
  }

  envoyer(res, commande, { status: 201 })
})

// GET /api/orders/mine
export const mesCommandes = asyncHandler(async (req, res) => {
  envoyer(res, await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))
})

// GET /api/orders/:id — propriétaire ou admin
export const lireCommande = asyncHandler(async (req, res) => {
  const commande = await Order.findById(req.params.id).populate('user', 'name email')
  const estProprietaire = commande?.user?._id.toString() === req.user._id.toString()
  // 404 dans les deux cas : on ne révèle pas l'existence de la commande d'un autre client
  if (!commande || (!estProprietaire && req.user.role !== 'admin')) throw new ErreurHttp(404, 'Commande introuvable.')
  envoyer(res, commande)
})

// GET /api/orders (admin)
export const listerCommandes = asyncHandler(async (_req, res) => {
  envoyer(res, await Order.find().populate('user', 'name email').sort({ createdAt: -1 }))
})

// PUT /api/orders/:id/status (admin)
export const changerStatut = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!STATUTS_COMMANDE.includes(status)) throw new ErreurHttp(400, 'Statut inconnu.')
  const commande = await Order.findById(req.params.id).populate('user', 'name email')
  if (!commande) throw new ErreurHttp(404, 'Commande introuvable.')
  commande.status = status
  envoyer(res, await commande.save())
})
