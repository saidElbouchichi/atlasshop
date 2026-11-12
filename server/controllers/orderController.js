import mongoose from 'mongoose'
import Order, { STATUTS_COMMANDE } from '../models/Order.js'
import Product from '../models/Product.js'
import { carteDisponible } from '../config/env.js'
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

  // Stock épuisé entre la commande et le paiement : la commande est payée, il faut la traiter à la main
  if (!(await retirerDuStock(commande.items))) {
    console.error(`[stock] Commande ${commande._id} payée avec un stock insuffisant : à vérifier (réassort ou remboursement).`)
  }
  await Order.updateOne({ _id: commande._id }, { stockReserve: true })
  return commande
}

const ajusterStock = (article, sens) =>
  // Au retrait, le stock ne descend jamais sous zéro
  Product.updateOne(
    sens < 0 ? { _id: article.product, stock: mongoose.trusted({ $gte: article.qty }) } : { _id: article.product },
    { $inc: { stock: sens * article.qty } },
  )

// Retire les articles du stock. Retourne false si l'un d'eux manquait.
async function retirerDuStock(articles) {
  const resultats = await Promise.all(articles.map((article) => ajusterStock(article, -1)))
  return resultats.every((resultat) => resultat.modifiedCount === 1)
}

const remettreEnStock = (articles) => Promise.all(articles.map((article) => ajusterStock(article, 1)))

// Retire tout ou rien : si un article manque, ceux déjà retirés sont remis en stock
async function reserverStock(articles) {
  const resultats = await Promise.all(articles.map((article) => ajusterStock(article, -1)))
  if (resultats.every((resultat) => resultat.modifiedCount === 1)) return true
  await remettreEnStock(articles.filter((_article, position) => resultats[position].modifiedCount === 1))
  return false
}

// Deux lignes du même produit sont additionnées avant le contrôle du stock
function fusionnerLignes(items) {
  const quantites = new Map()
  items.forEach(({ product, qty }) => quantites.set(String(product), (quantites.get(String(product)) ?? 0) + qty))
  return [...quantites].map(([product, qty]) => ({ product, qty }))
}

// POST /api/orders — les prix et les noms viennent de la base, jamais de la requête
export const creerCommande = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = 'carte' } = req.body
  if (paymentMethod === 'carte' && !carteDisponible()) {
    throw new ErreurHttp(400, 'Le paiement par carte est indisponible. Choisissez le paiement à la livraison.')
  }
  const items = fusionnerLignes(req.body.items)
  const produits = await Product.find({ _id: mongoose.trusted({ $in: items.map((article) => String(article.product)) }) })
  const parId = new Map(produits.map((produit) => [produit._id.toString(), produit]))

  const articles = items.map(({ product, qty }) => {
    const produit = parId.get(String(product))
    if (!produit) throw new ErreurHttp(400, 'Un produit du panier n’existe plus.')
    if (produit.stock < qty) throw new ErreurHttp(409, `Stock insuffisant pour « ${produit.name} ».`)
    return { product: produit._id, name: produit.name, image: produit.images[0] ?? null, price: produit.price, qty }
  })

  // Paiement à la livraison : les articles sont réservés dès la commande (par carte, ils le sont au paiement)
  const aLaLivraison = paymentMethod === 'livraison'
  if (aLaLivraison && !(await reserverStock(articles))) throw new ErreurHttp(409, 'Stock insuffisant pour cette commande.')

  const commande = await Order.create({
    user: req.user._id,
    items: articles,
    shippingAddress,
    paymentMethod,
    stockReserve: aLaLivraison,
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
  const commande = await Order.findById(req.params.id).select('+stockReserve').populate('user', 'name email')
  if (!commande) throw new ErreurHttp(404, 'Commande introuvable.')

  // Annulation : les articles réservés retournent en stock (une seule fois)
  if (status === 'annulée' && commande.stockReserve) {
    await remettreEnStock(commande.items)
    commande.stockReserve = false
  }
  // Paiement à la livraison : la commande est réglée au moment où elle est livrée
  if (status === 'livrée' && commande.paymentMethod === 'livraison' && !commande.isPaid) {
    commande.isPaid = true
    commande.paidAt = new Date()
  }
  commande.status = status
  envoyer(res, await commande.save())
})
