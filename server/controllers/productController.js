import mongoose from 'mongoose'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import { ErreurHttp, asyncHandler, creerSlug, echapperRegex, envoyer, normaliser } from '../utils/outils.js'

const LIMITE_PAR_DEFAUT = 6
const LIMITE_MAX = 100

const TRIS = {
  vedettes: { isFeatured: -1, createdAt: -1 },
  'prix-asc': { price: 1 },
  'prix-desc': { price: -1 },
  note: { rating: -1, numReviews: -1 },
  nom: { name: 1 },
}

// Champs qu'un admin peut écrire (rating, numReviews et reviews ne viennent jamais de la requête)
const CHAMPS_MODIFIABLES = ['name', 'subtitle', 'description', 'price', 'images', 'category', 'specs', 'stock', 'artisan', 'isFeatured']

const extraire = (corps) =>
  Object.fromEntries(CHAMPS_MODIFIABLES.filter((champ) => corps[champ] !== undefined).map((champ) => [champ, corps[champ]]))

async function exigerCategorie(slug) {
  if (!(await Category.exists({ slug }))) throw new ErreurHttp(400, 'Catégorie inconnue.')
}

async function slugLibre(nom, idExclu) {
  const base = creerSlug(nom)
  if (!base) throw new ErreurHttp(400, 'Nom de produit invalide.')
  const pris = await Product.exists({ slug: base, _id: mongoose.trusted({ $ne: idExclu ?? new mongoose.Types.ObjectId() }) })
  return pris ? `${base}-${Date.now().toString(36)}` : base
}

// GET /api/products?q&category&minPrice&maxPrice&featured&sort&page&limit
export const listerProduits = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, featured, sort } = req.query
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
  const limit = Math.min(LIMITE_MAX, Math.max(1, Number.parseInt(req.query.limit, 10) || LIMITE_PAR_DEFAUT))

  // Les valeurs viennent de l'URL : elles sont converties en types simples avant d'entrer dans le filtre
  const filtre = {}
  if (category) filtre.category = String(category)
  if (featured === 'true') filtre.isFeatured = true
  const prix = {}
  if (minPrice !== undefined && minPrice !== '') prix.$gte = Number(minPrice)
  if (maxPrice !== undefined && maxPrice !== '') prix.$lte = Number(maxPrice)
  if (Object.keys(prix).length > 0) filtre.price = mongoose.trusted(prix)
  if (q) filtre.recherche = mongoose.trusted({ $regex: echapperRegex(normaliser(q)) })

  const [produits, total] = await Promise.all([
    Product.find(filtre)
      .sort(TRIS[sort] ?? TRIS.vedettes)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filtre),
  ])

  envoyer(res, produits, { meta: { total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) } })
})

// GET /api/products/:slug
export const lireProduit = asyncHandler(async (req, res) => {
  const produit = await Product.findOne({ slug: String(req.params.slug) })
  if (!produit) throw new ErreurHttp(404, 'Produit introuvable.')
  envoyer(res, produit)
})

// POST /api/products (admin)
export const creerProduit = asyncHandler(async (req, res) => {
  const donnees = extraire(req.body)
  await exigerCategorie(donnees.category)
  const produit = await Product.create({ ...donnees, slug: await slugLibre(donnees.name) })
  envoyer(res, produit, { status: 201 })
})

// PUT /api/products/:id (admin)
export const modifierProduit = asyncHandler(async (req, res) => {
  const produit = await Product.findById(req.params.id)
  if (!produit) throw new ErreurHttp(404, 'Produit introuvable.')
  const donnees = extraire(req.body)
  if (donnees.category) await exigerCategorie(donnees.category)
  if (donnees.name && donnees.name !== produit.name) produit.slug = await slugLibre(donnees.name, produit._id)
  produit.set(donnees)
  envoyer(res, await produit.save())
})

// DELETE /api/products/:id (admin)
export const supprimerProduit = asyncHandler(async (req, res) => {
  const produit = await Product.findByIdAndDelete(req.params.id)
  if (!produit) throw new ErreurHttp(404, 'Produit introuvable.')
  envoyer(res, { _id: produit._id })
})

// POST /api/products/:id/reviews (connecté, un avis par produit)
export const ajouterAvis = asyncHandler(async (req, res) => {
  const produit = await Product.findById(req.params.id)
  if (!produit) throw new ErreurHttp(404, 'Produit introuvable.')
  const dejaDonne = produit.reviews.some((avis) => avis.user.toString() === req.user._id.toString())
  if (dejaDonne) throw new ErreurHttp(409, 'Vous avez déjà donné votre avis sur ce produit.')

  produit.reviews.unshift({ user: req.user._id, name: req.user.name, rating: req.body.rating, comment: req.body.comment })
  produit.recalculerNote()
  envoyer(res, await produit.save(), { status: 201 })
})
