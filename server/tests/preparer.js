import { randomBytes } from 'node:crypto'

// Environnement de test : défini avant tout import de l'application.
// Le secret JWT est généré à chaque lancement (aucun secret dans le dépôt).
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = randomBytes(48).toString('base64url')
process.env.ALLOW_FAKE_PAYMENT = 'true'
process.env.CLIENT_URL = 'http://localhost:5173'
process.env.STRIPE_SECRET_KEY = ''
process.env.STRIPE_WEBHOOK_SECRET = ''
process.env.CLOUDINARY_CLOUD_NAME = ''
