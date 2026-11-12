import mongoose from 'mongoose'
import { imageSchema } from './Product.js'
import { adresseSchemaPartage } from './User.js'

export const STATUTS_COMMANDE = ['en attente', 'payée', 'expédiée', 'livrée', 'annulée']

const articleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // Nom, image et prix sont copiés : la commande garde son contenu même si le produit change
    name: { type: String, required: true },
    image: { type: imageSchema, default: null },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [articleSchema], required: true },
    shippingAddress: { type: adresseSchemaPartage, required: true },
    itemsPrice: { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
    status: { type: String, enum: STATUTS_COMMANDE, default: 'en attente' },
    stripeSessionId: { type: String, default: '', select: false },
  },
  { timestamps: true },
)

orderSchema.set('toJSON', {
  transform: (_document, objet) => {
    const { __v: _version, stripeSessionId: _session, ...reste } = objet
    return reste
  },
})

export default mongoose.model('Order', orderSchema)
