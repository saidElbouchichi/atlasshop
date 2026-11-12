import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import User from '../models/User.js'
import { ErreurHttp, asyncHandler } from '../utils/outils.js'

const PREFIXE = 'Bearer '

// protect : exige un JWT valide (en-tête Authorization: Bearer <token>) et charge l'utilisateur
export const protect = asyncHandler(async (req, _res, next) => {
  const entete = req.headers.authorization ?? ''
  if (!entete.startsWith(PREFIXE)) throw new ErreurHttp(401, 'Connexion requise.')

  let contenu
  try {
    contenu = jwt.verify(entete.slice(PREFIXE.length), env.jwtSecret, { algorithms: ['HS256'] })
  } catch {
    throw new ErreurHttp(401, 'Session expirée ou invalide. Reconnectez-vous.')
  }

  // Le rôle est relu en base : un token émis avant un changement de rôle ne donne pas d'anciens droits
  const utilisateur = await User.findById(contenu.id)
  if (!utilisateur) throw new ErreurHttp(401, 'Ce compte n’existe plus.')

  req.user = utilisateur
  next()
})

// admin : à placer après protect
export const admin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new ErreurHttp(403, 'Accès réservé aux administrateurs.'))
  return next()
}
