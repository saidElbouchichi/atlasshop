import Category from '../models/Category.js'
import Product from '../models/Product.js'
import { ErreurHttp, asyncHandler, creerSlug, envoyer } from '../utils/outils.js'

// GET /api/categories
export const listerCategories = asyncHandler(async (_req, res) => {
  envoyer(res, await Category.find().sort({ createdAt: 1 }))
})

// POST /api/categories (admin)
export const creerCategorie = asyncHandler(async (req, res) => {
  const { name, image } = req.body
  const slug = creerSlug(name)
  if (!slug) throw new ErreurHttp(400, 'Nom de catégorie invalide.')
  if (await Category.exists({ slug })) throw new ErreurHttp(409, 'Cette catégorie existe déjà.')
  envoyer(res, await Category.create({ name, slug, image: image ?? null }), { status: 201 })
})

// PUT /api/categories/:id (admin) — le slug ne change pas : les produits y sont rattachés
export const modifierCategorie = asyncHandler(async (req, res) => {
  const categorie = await Category.findById(req.params.id)
  if (!categorie) throw new ErreurHttp(404, 'Catégorie introuvable.')
  if (req.body.name !== undefined) categorie.name = req.body.name
  if (req.body.image !== undefined) categorie.image = req.body.image
  envoyer(res, await categorie.save())
})

// DELETE /api/categories/:id (admin) — refusée tant que des produits l'utilisent
export const supprimerCategorie = asyncHandler(async (req, res) => {
  const categorie = await Category.findById(req.params.id)
  if (!categorie) throw new ErreurHttp(404, 'Catégorie introuvable.')
  if (await Product.exists({ category: categorie.slug })) {
    throw new ErreurHttp(409, 'Déplacez d’abord les produits de cette catégorie.')
  }
  await categorie.deleteOne()
  envoyer(res, { _id: categorie._id })
})
