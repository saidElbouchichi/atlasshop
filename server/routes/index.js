import { Router } from 'express'
import { body, param, query } from 'express-validator'
import multer from 'multer'
import * as auth from '../controllers/authController.js'
import * as categories from '../controllers/categoryController.js'
import * as commandes from '../controllers/orderController.js'
import * as paiements from '../controllers/paymentController.js'
import * as produits from '../controllers/productController.js'
import { admin, protect } from '../middleware/auth.js'
import { limiteurAuth, valider } from '../middleware/erreurs.js'
import { ErreurHttp } from '../utils/outils.js'

const TELEPHONE_MAROC = /^(?:\+212|0)[5-7]\d{8}$/
const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp']
const TAILLE_MAX_IMAGE = 2 * 1024 * 1024
const NOMBRE_MAX_IMAGES = 6

// --- Validateurs (express-validator) ---
const idMongo = (nom = 'id') => param(nom).isMongoId().withMessage('Identifiant invalide.')

const email = body('email').isEmail().withMessage('E-mail invalide.').normalizeEmail({ gmail_remove_dots: false })
const motDePasse = body('password').isString().isLength({ min: 6, max: 72 }).withMessage('Mot de passe de 6 à 72 caractères.')

const regles = {
  inscription: [body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Nom requis.'), email, motDePasse],
  connexion: [email, body('password').isString().notEmpty().withMessage('Mot de passe requis.')],
  role: [idMongo(), body('role').isString()],
  liste: [
    query('q').optional().isString().isLength({ max: 80 }),
    query('category').optional().isString().isLength({ max: 60 }),
    query(['minPrice', 'maxPrice']).optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Prix invalide.'),
    query('page').optional().isInt({ min: 1, max: 10000 }),
    query('sort').optional().isString().isLength({ max: 20 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  produit: (obligatoire) => {
    const champ = (nom) => (obligatoire ? body(nom) : body(nom).optional())
    return [
      champ('name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Nom requis.'),
      champ('description').isString().trim().isLength({ min: 10 }).withMessage('Description trop courte.'),
      champ('price').isFloat({ gt: 0, max: 1000000 }).withMessage('Prix entre 1 et 1 000 000.').toFloat(),
      champ('stock').isInt({ min: 0, max: 100000 }).withMessage('Stock entier entre 0 et 100 000.').toInt(),
      champ('category').isString().notEmpty().withMessage('Catégorie requise.'),
      body('subtitle').optional().isString().isLength({ max: 160 }),
      body('artisan').optional().isString().isLength({ max: 120 }),
      body('isFeatured').optional().isBoolean().toBoolean(),
      body('images').optional().isArray({ max: NOMBRE_MAX_IMAGES }),
      body('images.*.url').isURL({ protocols: ['https'], require_protocol: true }).withMessage('URL d’image en https requise.'),
      body('images.*.alt').optional().isString().isLength({ max: 200 }),
      body('specs').optional().isArray({ max: 12 }),
      body('specs.*.label').isString().trim().isLength({ min: 1, max: 40 }),
      body('specs.*.value').isString().trim().isLength({ min: 1, max: 80 }),
    ]
  },
  avis: [
    idMongo(),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Note de 1 à 5.').toInt(),
    body('comment').isString().trim().isLength({ min: 5, max: 600 }).withMessage('Avis de 5 à 600 caractères.'),
  ],
  categorie: [
    body('name').isString().trim().isLength({ min: 2, max: 40 }).withMessage('Nom de 2 à 40 caractères.'),
    body('image.url').optional().isURL({ protocols: ['https'], require_protocol: true }),
  ],
  commande: [
    body('items').isArray({ min: 1, max: 50 }).withMessage('Le panier est vide.'),
    body('items.*.product').isMongoId().withMessage('Produit invalide.'),
    body('items.*.qty').isInt({ min: 1, max: 99 }).withMessage('Quantité invalide.').toInt(),
    body('shippingAddress.fullName').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Nom du destinataire requis.'),
    body('shippingAddress.phone').customSanitizer((valeur) => String(valeur ?? '').replace(/[\s.-]/g, '')).matches(TELEPHONE_MAROC).withMessage('Numéro marocain attendu.'),
    body('shippingAddress.address').isString().trim().isLength({ min: 5, max: 200 }).withMessage('Adresse complète requise.'),
    body('shippingAddress.city').isString().trim().isLength({ min: 1, max: 80 }).withMessage('Ville requise.'),
    body('shippingAddress.postalCode').isString().trim().matches(/^\d{5}$/).withMessage('Code postal à 5 chiffres.'),
  ],
}

const televersement = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAILLE_MAX_IMAGE, files: NOMBRE_MAX_IMAGES },
  fileFilter: (_req, fichier, suite) =>
    TYPES_IMAGE.includes(fichier.mimetype) ? suite(null, true) : suite(new ErreurHttp(400, 'Images JPG, PNG ou WebP uniquement.')),
})

const reserveAdmin = [protect, admin]
const routes = Router()

// --- auth ---
routes.post('/auth/register', limiteurAuth, regles.inscription, valider, auth.inscrire)
routes.post('/auth/login', limiteurAuth, regles.connexion, valider, auth.connecter)
routes.post('/auth/logout', auth.deconnecter)
routes.get('/auth/me', protect, auth.moi)

// --- utilisateurs (admin) ---
routes.get('/users', reserveAdmin, auth.listerUtilisateurs)
routes.put('/users/:id/role', reserveAdmin, regles.role, valider, auth.changerRole)

// --- produits ---
routes.get('/products', regles.liste, valider, produits.listerProduits)
routes.get('/products/:slug', produits.lireProduit)
routes.post('/products', reserveAdmin, regles.produit(true), valider, produits.creerProduit)
routes.put('/products/:id', reserveAdmin, idMongo(), regles.produit(false), valider, produits.modifierProduit)
routes.delete('/products/:id', reserveAdmin, idMongo(), valider, produits.supprimerProduit)
routes.post('/products/:id/reviews', protect, regles.avis, valider, produits.ajouterAvis)

// --- catégories ---
routes.get('/categories', categories.listerCategories)
routes.post('/categories', reserveAdmin, regles.categorie, valider, categories.creerCategorie)
routes.put('/categories/:id', reserveAdmin, idMongo(), regles.categorie, valider, categories.modifierCategorie)
routes.delete('/categories/:id', reserveAdmin, idMongo(), valider, categories.supprimerCategorie)

// --- commandes ---
routes.post('/orders', protect, regles.commande, valider, commandes.creerCommande)
routes.get('/orders/mine', protect, commandes.mesCommandes)
routes.get('/orders', reserveAdmin, commandes.listerCommandes)
routes.get('/orders/:id', protect, idMongo(), valider, commandes.lireCommande)
routes.put('/orders/:id/status', reserveAdmin, idMongo(), body('status').isString(), valider, commandes.changerStatut)

// --- paiement et images ---
routes.post('/payments/create-checkout-session', protect, body('orderId').isMongoId().withMessage('Commande invalide.'), valider, paiements.creerSessionPaiement)
routes.post('/upload', reserveAdmin, televersement.array('images', NOMBRE_MAX_IMAGES), paiements.televerserImages)

export default routes
