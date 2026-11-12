import { v2 as cloudinary } from 'cloudinary'
import Stripe from 'stripe'
import { cloudinaryConfigure, env, estProduction, stripeConfigure } from '../config/env.js'
import Order from '../models/Order.js'
import { ErreurHttp, asyncHandler, envoyer } from '../utils/outils.js'
import { marquerPayee } from './orderController.js'

const DEVISE = 'mad'
const CENTIMES = 100
const DOSSIER_CLOUDINARY = 'atlasshop/produits'

let clientStripe = null
const stripe = () => {
  clientStripe ??= new Stripe(env.stripeSecretKey)
  return clientStripe
}

const urlClient = () => env.clientUrls[0]

function lignesStripe(commande) {
  const lignes = commande.items.map((article) => ({
    quantity: article.qty,
    price_data: { currency: DEVISE, unit_amount: Math.round(article.price * CENTIMES), product_data: { name: article.name } },
  }))
  if (commande.shippingPrice > 0) {
    lignes.push({
      quantity: 1,
      price_data: { currency: DEVISE, unit_amount: Math.round(commande.shippingPrice * CENTIMES), product_data: { name: 'Livraison' } },
    })
  }
  return lignes
}

// POST /api/payments/create-checkout-session { orderId }
export const creerSessionPaiement = asyncHandler(async (req, res) => {
  const commande = await Order.findById(req.body.orderId)
  if (!commande || commande.user.toString() !== req.user._id.toString()) throw new ErreurHttp(404, 'Commande introuvable.')
  if (commande.isPaid) throw new ErreurHttp(409, 'Cette commande est déjà payée.')
  if (commande.status === 'annulée') throw new ErreurHttp(409, 'Cette commande est annulée.')

  const urlConfirmation = `${urlClient()}/confirmation/${commande._id}`

  if (!stripeConfigure()) {
    // Sans clé Stripe, le paiement n'est simulé qu'en développement (jamais en production)
    if (estProduction()) throw new ErreurHttp(503, 'Le paiement est momentanément indisponible.')
    await marquerPayee(commande)
    return envoyer(res, { url: urlConfirmation, simule: true })
  }

  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: lignesStripe(commande),
    customer_email: req.user.email,
    client_reference_id: commande._id.toString(),
    metadata: { orderId: commande._id.toString() },
    success_url: `${urlConfirmation}?paiement=succes`,
    cancel_url: `${urlClient()}/checkout?paiement=annule`,
  })
  commande.stripeSessionId = session.id
  await commande.save()
  return envoyer(res, { url: session.url, simule: false })
})

// POST /api/payments/webhook — corps brut, signature Stripe vérifiée
export const webhookStripe = asyncHandler(async (req, res) => {
  if (!stripeConfigure() || !env.stripeWebhookSecret) throw new ErreurHttp(503, 'Webhook non configuré.')

  let evenement
  try {
    evenement = stripe().webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.stripeWebhookSecret)
  } catch {
    throw new ErreurHttp(400, 'Signature du webhook invalide.')
  }

  if (evenement.type === 'checkout.session.completed' && evenement.data.object.payment_status === 'paid') {
    const commande = await Order.findById(evenement.data.object.metadata?.orderId)
    if (commande) await marquerPayee(commande)
  }
  res.json({ received: true })
})

const envoyerVersCloudinary = (fichier) =>
  new Promise((resoudre, rejeter) => {
    const flux = cloudinary.uploader.upload_stream({ folder: DOSSIER_CLOUDINARY, resource_type: 'image' }, (erreur, resultat) =>
      erreur ? rejeter(erreur) : resoudre({ url: resultat.secure_url, publicId: resultat.public_id }),
    )
    flux.end(fichier.buffer)
  })

// POST /api/upload (admin, multipart « images ») -> [{ url, publicId }]
export const televerserImages = asyncHandler(async (req, res) => {
  if (!cloudinaryConfigure()) throw new ErreurHttp(503, 'L’envoi d’images n’est pas configuré (Cloudinary).')
  if (!req.files?.length) throw new ErreurHttp(400, 'Aucune image reçue.')
  cloudinary.config({ cloud_name: env.cloudinary.cloudName, api_key: env.cloudinary.apiKey, api_secret: env.cloudinary.apiSecret, secure: true })
  envoyer(res, await Promise.all(req.files.map(envoyerVersCloudinary)), { status: 201 })
})
