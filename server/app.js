import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env, estDeveloppement, estTest } from './config/env.js'
import { webhookStripe } from './controllers/paymentController.js'
import { errorHandler, limiteurGeneral, notFound, refuserOperateurs } from './middleware/erreurs.js'
import routes from './routes/index.js'

const TAILLE_MAX_JSON = '100kb'

// Construit l'application Express (sans l'écouter : pratique pour les tests)
export function creerApp() {
  const app = express()

  // Render place l'API derrière un proxy : nécessaire pour lire la vraie adresse IP (limitation de débit)
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(helmet())
  app.use(cors({ origin: env.clientUrls, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }))
  if (!estTest()) app.use(morgan(estDeveloppement() ? 'dev' : 'combined'))

  // Le webhook Stripe a besoin du corps brut pour vérifier la signature : il passe avant express.json()
  app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookStripe)

  app.use(express.json({ limit: TAILLE_MAX_JSON }))
  app.use(refuserOperateurs)
  app.use('/api', limiteurGeneral)

  app.get('/api/health', (_req, res) => res.json({ success: true, data: { status: 'ok' }, error: null }))
  app.use('/api', routes)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
