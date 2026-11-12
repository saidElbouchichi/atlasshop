import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// Enveloppe un contrôleur async : toute erreur part vers le gestionnaire d'erreurs central
export const asyncHandler = (controleur) => (req, res, next) =>
  Promise.resolve(controleur(req, res, next)).catch(next)

// Erreur métier avec un code HTTP (404, 400, 403…) et un message affichable au client
export class ErreurHttp extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Format unique de réponse : { success, data, error, meta }
export function envoyer(res, data, { status = 200, meta } = {}) {
  return res.status(status).json({ success: true, data, error: null, ...(meta ? { meta } : {}) })
}

export function creerToken(utilisateur) {
  return jwt.sign({ id: utilisateur._id.toString(), role: utilisateur.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

// Minuscules sans accents : sert au slug et à la recherche tolérante
export function normaliser(texte) {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

export function creerSlug(texte) {
  return normaliser(texte)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const echapperRegex = (texte) => String(texte).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Règles de livraison (identiques à celles affichées par le frontend)
export const SEUIL_LIVRAISON_OFFERTE = 1000
export const FRAIS_LIVRAISON = 45

export function calculerTotaux(articles) {
  const itemsPrice = articles.reduce((total, article) => total + article.price * article.qty, 0)
  const shippingPrice = itemsPrice === 0 || itemsPrice >= SEUIL_LIVRAISON_OFFERTE ? 0 : FRAIS_LIVRAISON
  return { itemsPrice, shippingPrice, totalPrice: itemsPrice + shippingPrice }
}
