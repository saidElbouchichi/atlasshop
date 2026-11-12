import mongoose from 'mongoose'
import Order, { STATUTS_COMMANDE } from '../models/Order.js'
import Product from '../models/Product.js'
import { ErreurHttp, asyncHandler, calculerTotaux, envoyer } from '../utils/outils.js'

const NOMBRE_MAX_ADRESSES = 5

// Marque une commande comme payée et décrémente les stocks (webhook Stripe ou paiement simulé).
// Retourne la commande payée, ou null si elle l'était déjà ou si elle est annulée.
export async function marquerPayee(idCommande) {
  // Une seule requête atomique : si Stripe rejoue l'événement, le second appel ne trouve plus
  // de commande « non payée » et le stock n'est donc décrémenté qu'une fois
  const commande = await Order.findOneAndUpdate(
    { _id: idCommande, isPaid: false, status: mongoose.trusted({ $ne: 'annulée' }) },
    { isPaid: true, paidAt: new Date(), status: 'payée' },
    { new: true },
  )
  if (!commande) return null

  const resultats = await Promise.all(
    commande.items.map((article) =>
      // Le stock ne descend jamais sous zéro
      Product.updateOne({ _id: article.product, stock: mongoose.trusted({ $gte: article.qty }) }, { $inc: { stock: -article.qty } }),
    ),
  )
  // Stock épuisé entre la commande et le paiement : la commande est payée, il faut la traiter à la main
  if (resultats.some((resultat) => resultat.modifiedCount === 0)) {
    console.error(`[stock] Commande ${commande._id} payée avec un stock insuffisant : à vérifier (réassort ou remboursement).`)
  }
  return commande
}

// Deux lignes du même produit sont additionnées avant le contrôle du stock
function fusionnerLignes(items) {
  const quantites = new Map()
  items.forEach(({ product, qty }) => quantites.set(String(product), (quantites.get(String(product)) ?? 0) + qty))
  return [...quantites].map(([product, qty]) => ({ product, qty }))
}

// POST /api/orders — les prix et les noms viennent de la base, jamais de la requête
export const creerCommande = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body
  const items = fusionnerLignes(req.body.items)
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
