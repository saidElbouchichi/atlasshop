import mongoose from 'mongoose'
import { imageSchema } from './Product.js'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: imageSchema, default: null },
  },
  { timestamps: true },
)

categorySchema.set('toJSON', {
  transform: (_document, objet) => {
    const { __v: _version, ...reste } = objet
    return reste
  },
})

export default mongoose.model('Category', categorySchema)
