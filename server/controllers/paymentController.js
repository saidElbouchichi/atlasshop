import { v2 as cloudinary } from 'cloudinary'
import Stripe from 'stripe'
import { cloudinaryConfigure, env, paiementSimuleAutorise, stripeConfigure } from '../config/env.js'
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
    // Sans clé Stripe, le paiement n'est simulé qu'en local ET avec ALLOW_FAKE_PAYMENT=true
    if (!paiementSimuleAutorise()) throw new ErreurHttp(503, 'Le paiement est momentanément indisponible.')
    await marquerPayee(commande._id)
    return envoyer(res, { url: urlConfirmation, simule: true })
  }

  // Une seule session ouverte par commande : l'ancienne est fermée pour éviter un double paiement
  const commandeAvecSession = await Order.findById(commande._id).select('+stripeSessionId')
  if (commandeAvecSession.stripeSessionId) {
    await stripe().checkout.sessions.expire(commandeAvecSession.stripeSessionId).catch(() => null)
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

  const session = evenement.data.object
  if (evenement.type === 'checkout.session.completed' && session.payment_status === 'paid') {
    const commande = await Order.findById(session.metadata?.orderId).select('+stripeSessionId')
    // La session doit être celle de la commande, pour le bon montant et la bonne devise
    const coherente =
      commande &&
      commande.stripeSessionId === session.id &&
      session.currency === DEVISE &&
      session.amount_total === Math.round(commande.totalPrice * CENTIMES)
    if (coherente) await marquerPayee(commande._id)
    else console.error(`[stripe] Session ${session.id} incohérente avec la commande ${session.metadata?.orderId} : paiement à vérifier.`)
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
