import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { env } from '../config/env.js'

export const ROLES = ['user', 'admin']

const adresseSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> le hash n'est jamais renvoyé par défaut
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
    addresses: { type: [adresseSchema], default: [] },
  },
  { timestamps: true },
)

// Le mot de passe est hashé avant chaque sauvegarde où il a changé
userSchema.pre('save', async function hasherMotDePasse(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, env.bcryptRounds)
  return next()
})

userSchema.methods.verifierMotDePasse = function verifierMotDePasse(motDePasse) {
  return bcrypt.compare(motDePasse, this.password)
}

userSchema.set('toJSON', {
  transform: (_document, objet) => {
    const { password: _retire, __v: _version, ...reste } = objet
    return reste
  },
})

export const adresseSchemaPartage = adresseSchema
export default mongoose.model('User', userSchema)
