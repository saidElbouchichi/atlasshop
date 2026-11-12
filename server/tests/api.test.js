import { randomBytes } from 'node:crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import request from 'supertest'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { creerApp } from '../app.js'
import { connecterDB, deconnecterDB } from '../config/db.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import { EMAIL_ADMIN, EMAIL_CLIENT, peupler } from '../seed/peupler.js'

// Tests d'intégration de l'API sur une base MongoDB en mémoire, réinitialisée avant chaque test.
const motDePasseAdmin = randomBytes(9).toString('base64url')
const motDePasseClient = randomBytes(9).toString('base64url')
const adresse = { fullName: 'Salma Bennani', phone: '06 12 34 56 78', address: '14 rue des Orangers', city: 'Marrakech', postalCode: '40000' }

let mongo
let api
let jetonAdmin
let jetonClient

const connexion = async (email, password) => (await api.post('/api/auth/login').send({ email, password })).body.data.token
const avec = (jeton) => ({ Authorization: `Bearer ${jeton}` })
const produitParSlug = async (slug) => (await api.get(`/api/products/${slug}`)).body.data

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  await connecterDB(mongo.getUri())
  api = request(creerApp())
})

afterAll(async () => {
  await deconnecterDB()
  await mongo.stop()
})

beforeEach(async () => {
  await peupler({ motDePasseAdmin, motDePasseClient })
  jetonAdmin = await connexion(EMAIL_ADMIN, motDePasseAdmin)
  jetonClient = await connexion(EMAIL_CLIENT, motDePasseClient)
})

describe('auth', () => {
  test('inscrit un client, sans jamais renvoyer le mot de passe ni accepter un rôle', async () => {
    const reponse = await api.post('/api/auth/register').send({ name: 'Nora Alami', email: 'nora@exemple.ma', password: 'secret-nora', role: 'admin' })

    expect(reponse.status).toBe(201)
    expect(reponse.body.data.user).toMatchObject({ name: 'Nora Alami', email: 'nora@exemple.ma', role: 'user' })
    expect(reponse.body.data.user.password).toBeUndefined()
    expect(reponse.body.data.token).toEqual(expect.any(String))
  })

  test('stocke le mot de passe hashé', async () => {
    const utilisateur = await User.findOne({ email: EMAIL_CLIENT }).select('+password')

    expect(utilisateur.password).not.toBe(motDePasseClient)
    expect(utilisateur.password).toMatch(/^\$2[aby]\$/)
  })

  test('refuse un e-mail déjà utilisé et des données invalides', async () => {
    const doublon = await api.post('/api/auth/register').send({ name: 'Salma', email: EMAIL_CLIENT, password: 'secret-123' })
    const invalide = await api.post('/api/auth/register').send({ name: 'S', email: 'pas-un-email', password: '123' })

    expect(doublon.status).toBe(409)
    expect(invalide.status).toBe(400)
    expect(Object.keys(invalide.body.champs)).toEqual(expect.arrayContaining(['name', 'email', 'password']))
  })

  test('refuse un mauvais mot de passe avec le même message qu’un compte inconnu', async () => {
    const mauvais = await api.post('/api/auth/login').send({ email: EMAIL_CLIENT, password: 'mauvais-mot-de-passe' })
    const inconnu = await api.post('/api/auth/login').send({ email: 'personne@exemple.ma', password: 'peu-importe' })

    expect(mauvais.status).toBe(401)
    expect(inconnu.status).toBe(401)
    expect(mauvais.body.error).toBe(inconnu.body.error)
  })

  test('bloque une tentative d’injection NoSQL à la connexion', async () => {
    const reponse = await api.post('/api/auth/login').send({ email: { $gt: '' }, password: { $gt: '' } })

    expect(reponse.status).toBe(400)
  })

  test('/me exige un jeton valide', async () => {
    const sansJeton = await api.get('/api/auth/me')
    const fauxJeton = await api.get('/api/auth/me').set(avec('jeton.invalide.ici'))
    const moi = await api.get('/api/auth/me').set(avec(jetonClient))

    expect(sansJeton.status).toBe(401)
    expect(fauxJeton.status).toBe(401)
    expect(moi.body.data.user.email).toBe(EMAIL_CLIENT)
  })
})

describe('produits', () => {
  test('le seed fournit 20 produits et 5 catégories', async () => {
    const produits = await api.get('/api/products?limit=100')
    const categories = await api.get('/api/categories')

    expect(produits.body.meta.total).toBe(20)
    expect(categories.body.data).toHaveLength(5)
  })

  test('pagine les résultats', async () => {
    const page2 = await api.get('/api/products?limit=6&page=2')

    expect(page2.body.data).toHaveLength(6)
    expect(page2.body.meta).toEqual({ total: 20, page: 2, limit: 6, pages: 4 })
  })

  test('filtre par catégorie et par fourchette de prix', async () => {
    const cuir = await api.get('/api/products?category=cuir&limit=100')
    const prix = await api.get('/api/products?minPrice=200&maxPrice=400&limit=100')

    expect(cuir.body.data.length).toBeGreaterThan(0)
    expect(cuir.body.data.every((produit) => produit.category === 'cuir')).toBe(true)
    expect(prix.body.data.every((produit) => produit.price >= 200 && produit.price <= 400)).toBe(true)
  })

  test('la recherche ignore la casse et les accents', async () => {
    const reponse = await api.get(`/api/products?q=${encodeURIComponent('THEIERE')}`)

    expect(reponse.body.data.map((produit) => produit.slug)).toEqual(['theiere-fassia'])
  })

  test('trie par prix croissant', async () => {
    const prix = (await api.get('/api/products?sort=prix-asc&limit=100')).body.data.map((produit) => produit.price)

    expect(prix).toEqual([...prix].sort((a, b) => a - b))
  })

  test('refuse des paramètres invalides et un caractère spécial ne casse pas la recherche', async () => {
    const invalide = await api.get('/api/products?minPrice=abc')
    const special = await api.get(`/api/products?q=${encodeURIComponent('(.*')}`)

    expect(invalide.status).toBe(400)
    expect(special.status).toBe(200)
    expect(special.body.data).toEqual([])
  })

  test('lit un produit par son slug et renvoie 404 sinon', async () => {
    expect((await api.get('/api/products/amphore-zagora')).body.data.name).toBe('Amphore Zagora')
    expect((await api.get('/api/products/inexistant')).status).toBe(404)
  })
})

describe('administration des produits et catégories', () => {
  const nouveau = { name: 'Plateau Fès', description: 'Plateau en laiton ciselé à la main.', price: 350, stock: 4, category: 'decoration', images: [{ url: 'https://images.unsplash.com/photo-1', alt: 'Plateau' }] }

  test('réserve la création aux administrateurs', async () => {
    const visiteur = await api.post('/api/products').send(nouveau)
    const client = await api.post('/api/products').set(avec(jetonClient)).send(nouveau)

    expect(visiteur.status).toBe(401)
    expect(client.status).toBe(403)
  })

  test('crée, modifie puis supprime un produit', async () => {
    const cree = await api.post('/api/products').set(avec(jetonAdmin)).send({ ...nouveau, rating: 5, numReviews: 999 })
    const id = cree.body.data._id
    const modifie = await api.put(`/api/products/${id}`).set(avec(jetonAdmin)).send({ price: 400 })
    const supprime = await api.delete(`/api/products/${id}`).set(avec(jetonAdmin))

    expect(cree.status).toBe(201)
    // La note et le nombre d'avis ne peuvent pas être forcés à la création
    expect(cree.body.data).toMatchObject({ slug: 'plateau-fes', rating: 0, numReviews: 0 })
    expect(modifie.body.data.price).toBe(400)
    expect(supprime.status).toBe(200)
    expect((await api.get('/api/products/plateau-fes')).status).toBe(404)
  })

  test('refuse un produit invalide ou une catégorie inconnue', async () => {
    const invalide = await api.post('/api/products').set(avec(jetonAdmin)).send({ ...nouveau, price: -5, name: '' })
    const categorie = await api.post('/api/products').set(avec(jetonAdmin)).send({ ...nouveau, category: 'inconnue' })

    expect(invalide.status).toBe(400)
    expect(categorie.status).toBe(400)
  })

  test('gère les catégories et protège celles qui contiennent des produits', async () => {
    const creee = await api.post('/api/categories').set(avec(jetonAdmin)).send({ name: 'Bijoux' })
    const doublon = await api.post('/api/categories').set(avec(jetonAdmin)).send({ name: 'bijoux' })
    const renommee = await api.put(`/api/categories/${creee.body.data._id}`).set(avec(jetonAdmin)).send({ name: 'Bijoux berbères' })
    const supprimee = await api.delete(`/api/categories/${creee.body.data._id}`).set(avec(jetonAdmin))
    const tapis = (await api.get('/api/categories')).body.data.find((categorie) => categorie.slug === 'tapis')
    const utilisee = await api.delete(`/api/categories/${tapis._id}`).set(avec(jetonAdmin))

    expect(creee.body.data.slug).toBe('bijoux')
    expect(doublon.status).toBe(409)
    expect(renommee.body.data).toMatchObject({ name: 'Bijoux berbères', slug: 'bijoux' })
    expect(supprimee.status).toBe(200)
    expect(utilisee.status).toBe(409)
  })

  test('liste les utilisateurs et change un rôle, sauf le sien', async () => {
    const refuse = await api.get('/api/users').set(avec(jetonClient))
    const liste = await api.get('/api/users').set(avec(jetonAdmin))
    const client = liste.body.data.find((utilisateur) => utilisateur.email === EMAIL_CLIENT)
    const admin = liste.body.data.find((utilisateur) => utilisateur.email === EMAIL_ADMIN)
    const promu = await api.put(`/api/users/${client._id}/role`).set(avec(jetonAdmin)).send({ role: 'admin' })
    const soiMeme = await api.put(`/api/users/${admin._id}/role`).set(avec(jetonAdmin)).send({ role: 'user' })

    expect(refuse.status).toBe(403)
    // Le rôle est relu en base à chaque requête : le client promu accède aussitôt à l'admin
    expect((await api.get('/api/users').set(avec(jetonClient))).status).toBe(200)
    expect(liste.body.data.every((utilisateur) => utilisateur.password === undefined)).toBe(true)
    expect(promu.body.data.role).toBe('admin')
    expect(soiMeme.status).toBe(400)
  })
})

describe('avis', () => {
  test('un client connecté donne un avis, une seule fois par produit', async () => {
    const produit = await produitParSlug('bol-safi-emaille')
    const avis = { rating: 4, comment: 'Très joli bol, bien emballé.' }

    const visiteur = await api.post(`/api/products/${produit._id}/reviews`).send(avis)
    const premier = await api.post(`/api/products/${produit._id}/reviews`).set(avec(jetonClient)).send(avis)
    const second = await api.post(`/api/products/${produit._id}/reviews`).set(avec(jetonClient)).send(avis)

    expect(visiteur.status).toBe(401)
    expect(premier.status).toBe(201)
    expect(premier.body.data).toMatchObject({ rating: 4, numReviews: 1 })
    expect(premier.body.data.reviews[0]).toMatchObject({ name: 'Salma Bennani', rating: 4 })
    expect(second.status).toBe(409)
  })
})

describe('commandes et paiement', () => {
  const commander = async (jeton, articles) => api.post('/api/orders').set(avec(jeton)).send({ items: articles, shippingAddress: adresse })

  test('calcule les prix côté serveur, sans se fier au client', async () => {
    const bol = await produitParSlug('bol-safi-emaille')

    const reponse = await api.post('/api/orders').set(avec(jetonClient)).send({ items: [{ product: bol._id, qty: 2, price: 1 }], shippingAddress: adresse, totalPrice: 1 })

    expect(reponse.status).toBe(201)
    expect(reponse.body.data).toMatchObject({ itemsPrice: 360, shippingPrice: 45, totalPrice: 405, isPaid: false, status: 'en attente' })
    expect(reponse.body.data.items[0]).toMatchObject({ name: 'Bol Safi émaillé', price: 180, qty: 2 })
    expect(reponse.body.data.shippingAddress.phone).toBe('0612345678')
  })

  test('offre la livraison à partir de 1 000 MAD', async () => {
    const besace = await produitParSlug('besace-medina')

    expect((await commander(jetonClient, [{ product: besace._id, qty: 1 }])).body.data).toMatchObject({ shippingPrice: 0, totalPrice: 1250 })
  })

  test('refuse un panier vide, une adresse invalide ou un stock insuffisant', async () => {
    const tapis = await produitParSlug('tapis-beni-ouarain-l')
    const vide = await commander(jetonClient, [])
    const mauvaiseAdresse = await api.post('/api/orders').set(avec(jetonClient)).send({ items: [{ product: tapis._id, qty: 1 }], shippingAddress: { ...adresse, phone: '123' } })
    const tropGrand = await commander(jetonClient, [{ product: tapis._id, qty: 50 }])

    expect(vide.status).toBe(400)
    expect(mauvaiseAdresse.status).toBe(400)
    expect(tropGrand.status).toBe(409)
  })

  test('une commande n’est visible que par son propriétaire ou un admin', async () => {
    const bol = await produitParSlug('bol-safi-emaille')
    const { _id } = (await commander(jetonClient, [{ product: bol._id, qty: 1 }])).body.data
    await api.post('/api/auth/register').send({ name: 'Autre Client', email: 'autre@exemple.ma', password: 'secret-autre' })
    const jetonAutre = await connexion('autre@exemple.ma', 'secret-autre')

    expect((await api.get(`/api/orders/${_id}`).set(avec(jetonClient))).status).toBe(200)
    expect((await api.get(`/api/orders/${_id}`).set(avec(jetonAdmin))).status).toBe(200)
    expect((await api.get(`/api/orders/${_id}`).set(avec(jetonAutre))).status).toBe(404)
    expect((await api.get('/api/orders/mine').set(avec(jetonAutre))).body.data).toEqual([])
    expect((await api.get('/api/orders/mine').set(avec(jetonClient))).body.data).toHaveLength(1)
    expect((await api.get('/api/orders').set(avec(jetonClient))).status).toBe(403)
    expect((await api.get('/api/orders').set(avec(jetonAdmin))).body.data[0].user.email).toBe(EMAIL_CLIENT)
  })

  test('le paiement (simulé sans clé Stripe en développement) marque la commande payée et décrémente le stock', async () => {
    const bol = await produitParSlug('bol-safi-emaille')
    const { _id } = (await commander(jetonClient, [{ product: bol._id, qty: 3 }])).body.data

    const paiement = await api.post('/api/payments/create-checkout-session').set(avec(jetonClient)).send({ orderId: _id })
    const commande = (await api.get(`/api/orders/${_id}`).set(avec(jetonClient))).body.data
    const stockApres = (await Product.findById(bol._id)).stock
    const deuxiemeFois = await api.post('/api/payments/create-checkout-session').set(avec(jetonClient)).send({ orderId: _id })

    expect(paiement.body.data).toEqual({ url: `http://localhost:5173/confirmation/${_id}`, simule: true })
    expect(commande).toMatchObject({ isPaid: true, status: 'payée' })
    expect(stockApres).toBe(bol.stock - 3)
    expect(deuxiemeFois.status).toBe(409)
  })

  test('on ne peut pas payer la commande d’un autre client', async () => {
    const bol = await produitParSlug('bol-safi-emaille')
    const { _id } = (await commander(jetonClient, [{ product: bol._id, qty: 1 }])).body.data

    expect((await api.post('/api/payments/create-checkout-session').set(avec(jetonAdmin)).send({ orderId: _id })).status).toBe(404)
  })

  test('seul un admin change le statut, parmi les statuts connus', async () => {
    const bol = await produitParSlug('bol-safi-emaille')
    const { _id } = (await commander(jetonClient, [{ product: bol._id, qty: 1 }])).body.data

    const client = await api.put(`/api/orders/${_id}/status`).set(avec(jetonClient)).send({ status: 'livrée' })
    const inconnu = await api.put(`/api/orders/${_id}/status`).set(avec(jetonAdmin)).send({ status: 'perdue' })
    const expediee = await api.put(`/api/orders/${_id}/status`).set(avec(jetonAdmin)).send({ status: 'expédiée' })

    expect(client.status).toBe(403)
    expect(inconnu.status).toBe(400)
    expect(expediee.body.data.status).toBe('expédiée')
  })
})

describe('erreurs', () => {
  test('route inconnue, identifiant mal formé et upload non configuré', async () => {
    const inconnue = await api.get('/api/nexiste-pas')
    const malForme = await api.delete('/api/products/pas-un-id').set(avec(jetonAdmin))
    const upload = await api.post('/api/upload').set(avec(jetonAdmin))
    const webhook = await api.post('/api/payments/webhook').set('Content-Type', 'application/json').send('{}')

    expect(inconnue.status).toBe(404)
    expect(inconnue.body).toMatchObject({ success: false, data: null })
    expect(malForme.status).toBe(400)
    expect(upload.status).toBe(503)
    expect(webhook.status).toBe(503)
  })
})
