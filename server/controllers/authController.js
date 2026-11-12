import User, { ROLES } from '../models/User.js'
import { ErreurHttp, asyncHandler, creerToken, envoyer } from '../utils/outils.js'

const MESSAGE_IDENTIFIANTS = 'E-mail ou mot de passe incorrect.'

const reponseSession = (utilisateur) => ({ user: utilisateur.toJSON(), token: creerToken(utilisateur) })

// POST /api/auth/register
export const inscrire = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  if (await User.exists({ email })) throw new ErreurHttp(409, 'Un compte existe déjà avec cet e-mail.')
  // Le rôle n'est jamais lu depuis la requête : tout nouvel inscrit est un simple client
  const utilisateur = await User.create({ name, email, password })
  envoyer(res, reponseSession(utilisateur), { status: 201 })
})

// POST /api/auth/login
export const connecter = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const utilisateur = await User.findOne({ email }).select('+password')
  // Même message que l'e-mail existe ou non : on ne révèle pas quels comptes existent
  if (!utilisateur || !(await utilisateur.verifierMotDePasse(password))) {
    throw new ErreurHttp(401, MESSAGE_IDENTIFIANTS)
  }
  envoyer(res, reponseSession(utilisateur))
})

// POST /api/auth/logout — le JWT est sans état : le client supprime son token
export const deconnecter = (_req, res) => envoyer(res, { message: 'Déconnecté.' })

// GET /api/auth/me
export const moi = (req, res) => envoyer(res, { user: req.user.toJSON() })

// GET /api/users (admin)
export const listerUtilisateurs = asyncHandler(async (_req, res) => {
  envoyer(res, await User.find().sort({ createdAt: 1 }))
})

// PUT /api/users/:id/role (admin)
export const changerRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  if (!ROLES.includes(role)) throw new ErreurHttp(400, 'Rôle inconnu.')
  if (req.params.id === req.user._id.toString()) {
    throw new ErreurHttp(400, 'Vous ne pouvez pas modifier votre propre rôle.')
  }
  const utilisateur = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true })
  if (!utilisateur) throw new ErreurHttp(404, 'Utilisateur introuvable.')
  envoyer(res, utilisateur)
})
