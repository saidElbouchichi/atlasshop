import rateLimit from 'express-rate-limit'
import { validationResult } from 'express-validator'
import multer from 'multer'
import { estProduction, estTest } from '../config/env.js'
import { ErreurHttp } from '../utils/outils.js'

// Termine une chaîne de validateurs express-validator : 400 avec le détail par champ
export function valider(req, res, next) {
  const resultat = validationResult(req)
  if (resultat.isEmpty()) return next()
  const champs = Object.fromEntries(resultat.array().map((erreur) => [erreur.path, erreur.msg]))
  return res.status(400).json({ success: false, data: null, error: 'Données invalides.', champs })
}

// Refuse toute clé commençant par « $ » ou contenant « . » dans le corps (injection NoSQL)
export function refuserOperateurs(req, _res, next) {
  const contientOperateur = (valeur) => {
    if (!valeur || typeof valeur !== 'object') return false
    return Object.entries(valeur).some(([cle, enfant]) => cle.startsWith('$') || cle.includes('.') || contientOperateur(enfant))
  }
  if (contientOperateur(req.body)) return next(new ErreurHttp(400, 'Données invalides.'))
  return next()
}

const QUINZE_MINUTES = 15 * 60 * 1000
const limiteur = (max, message) =>
  rateLimit({
    windowMs: QUINZE_MINUTES,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => estTest(),
    message: { success: false, data: null, error: message },
  })

export const limiteurGeneral = limiteur(600, 'Trop de requêtes. Réessayez dans quelques minutes.')
// Plus strict sur l'authentification : freine les essais de mots de passe
export const limiteurAuth = limiteur(20, 'Trop de tentatives. Réessayez dans quelques minutes.')

export function notFound(req, _res, next) {
  next(new ErreurHttp(404, `Route introuvable : ${req.method} ${req.originalUrl}`))
}

// Traduit les erreurs connues en réponses claires ; le détail technique reste côté serveur
function traduire(erreur) {
  if (erreur instanceof ErreurHttp) return { status: erreur.status, message: erreur.message }
  if (erreur instanceof multer.MulterError) return { status: 400, message: 'Fichier refusé : image de 2 Mo maximum.' }
  if (erreur.name === 'ValidationError') return { status: 400, message: 'Données invalides.' }
  if (erreur.name === 'CastError') return { status: 404, message: 'Ressource introuvable.' }
  if (erreur.code === 11000) return { status: 409, message: 'Cette valeur existe déjà.' }
  if (erreur.type === 'entity.parse.failed') return { status: 400, message: 'JSON invalide.' }
  if (erreur.type === 'entity.too.large') return { status: 413, message: 'Requête trop volumineuse.' }
  return { status: 500, message: 'Erreur interne du serveur.' }
}

// eslint-disable-next-line no-unused-vars -- Express reconnaît un gestionnaire d'erreurs à ses 4 arguments
export function errorHandler(erreur, req, res, _next) {
  const { status, message } = traduire(erreur)
  if (status >= 500 && !estTest()) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, erreur)
  }
  res.status(status).json({
    success: false,
    data: null,
    error: message,
    ...(status >= 500 && !estProduction() ? { detail: erreur.message } : {}),
  })
}
