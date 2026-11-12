import mongoose from 'mongoose'
import { normaliser } from '../utils/outils.js'

export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, default: '', trim: true },
    // Identifiant Cloudinary (absent pour les images du seed)
    publicId: { type: String, default: '' },
  },
  { _id: false },
)

const avisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 600 },
  },
  { timestamps: true },
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    subtitle: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [imageSchema], default: [] },
    // Slug de la catégorie (validé par rapport à la collection Category à l'écriture)
    category: { type: String, required: true, index: true },
    specs: { type: [{ _id: false, label: String, value: String }], default: [] },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    reviews: { type: [avisSchema], default: [] },
    artisan: { type: String, default: '', trim: true },
    isFeatured: { type: Boolean, default: false },
    // Texte normalisé (sans accents) pour la recherche ?q
    recherche: { type: String, select: false },
  },
  { timestamps: true },
)

productSchema.pre('save', function indexerRecherche(next) {
  this.recherche = normaliser(`${this.name} ${this.description} ${this.artisan} ${this.category}`)
  next()
})

// Recalcule la note moyenne à partir des avis
productSchema.methods.recalculerNote = function recalculerNote() {
  this.numReviews = this.reviews.length
  const somme = this.reviews.reduce((total, avis) => total + avis.rating, 0)
  this.rating = this.numReviews === 0 ? 0 : Math.round((somme / this.numReviews) * 10) / 10
}

productSchema.set('toJSON', {
  transform: (_document, objet) => {
    const { __v: _version, recherche: _recherche, ...reste } = objet
    return reste
  },
})

export default mongoose.model('Product', productSchema)
