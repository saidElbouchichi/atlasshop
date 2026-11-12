import { describe, expect, test } from 'vitest'
import { chercherProduits, creerSlug, filtrerProduits, lireCriteres, normaliser, paginer, trierProduits } from './catalogue'
import { FRAIS_LIVRAISON, calculerTotaux, chiffreAffaires, creerCommande, formaterDate } from './commande'
import { sourcesPhoto } from './images'
import { ecrireStockage, lireStockage } from './stockage'
import {
  estValide,
  validerAdresse,
  validerAvis,
  validerConnexion,
  validerInscription,
  validerProduit,
} from './validation'

const produits = [
  { _id: 'a', name: 'Tapis Azilal', description: 'Laine écrue', artisan: 'Fatima', category: 'tapis', price: 4600, rating: 4.8, isFeatured: true },
  { _id: 'b', name: 'Bol Safi', description: 'Céramique émaillée', artisan: 'Serghini', category: 'poterie', price: 180, rating: 4.6, isFeatured: false },
  { _id: 'c', name: 'Besace Médina', description: 'Cuir de Fès', artisan: 'Chouara', category: 'cuir', price: 1250, rating: 4.9, isFeatured: true },
]
const sansFiltre = { q: '', category: '', minPrice: null, maxPrice: null, sort: 'vedettes', page: 1 }
const ids = (liste) => liste.map((produit) => produit._id)

describe('catalogue', () => {
  test('la recherche ignore la casse et les accents', () => {
    expect(normaliser('  Céramique ')).toBe('ceramique')
    expect(ids(filtrerProduits(produits, { ...sansFiltre, q: 'CERAMIQUE' }))).toEqual(['b'])
  })

  test('la recherche porte aussi sur le nom de l’artisan', () => {
    expect(ids(filtrerProduits(produits, { ...sansFiltre, q: 'fatima' }))).toEqual(['a'])
  })

  test('filtre par catégorie et par fourchette de prix', () => {
    expect(ids(filtrerProduits(produits, { ...sansFiltre, category: 'cuir' }))).toEqual(['c'])
    expect(ids(filtrerProduits(produits, { ...sansFiltre, minPrice: 200, maxPrice: 2000 }))).toEqual(['c'])
  })

  test('trie sans modifier le tableau d’origine', () => {
    const tries = trierProduits(produits, 'prix-asc')

    expect(ids(tries)).toEqual(['b', 'c', 'a'])
    expect(ids(produits)).toEqual(['a', 'b', 'c'])
    expect(ids(trierProduits(produits, 'note'))).toEqual(['c', 'a', 'b'])
  })

  test('retombe sur le tri par défaut si le tri est inconnu', () => {
    expect(ids(trierProduits(produits, 'inconnu'))).toEqual(['a', 'c', 'b'])
  })

  test('pagine et ramène une page hors limites dans les bornes', () => {
    const resultat = paginer([1, 2, 3, 4, 5], 9, 2)

    expect(resultat).toEqual({ elements: [5], page: 3, totalPages: 3, total: 5 })
    expect(paginer([], 1).totalPages).toBe(1)
  })

  test('assainit les paramètres d’URL', () => {
    const criteres = lireCriteres(new URLSearchParams('q=tapis&minPrice=-5&maxPrice=abc&sort=pirate&page=0'))

    expect(criteres).toEqual({ q: 'tapis', category: '', minPrice: null, maxPrice: null, sort: 'vedettes', page: 1 })
  })

  test('enchaîne filtre, tri et pagination', () => {
    const resultat = chercherProduits(produits, { ...sansFiltre, sort: 'prix-desc' })

    expect(ids(resultat.elements)).toEqual(['a', 'c', 'b'])
    expect(resultat.total).toBe(3)
  })

  test('crée un slug propre', () => {
    expect(creerSlug("  Huile d'Argan Pure ! ")).toBe('huile-d-argan-pure')
    expect(creerSlug('Théière « Fès »')).toBe('theiere-fes')
  })
})

describe('commande', () => {
  const articles = [
    { product: 'b', name: 'Bol', image: { id: 'x', alt: 'Bol' }, price: 180, qty: 2, stock: 30, slug: 'bol' },
  ]
  const utilisateur = { _id: 'u2', name: 'Salma', email: 'salma@atlasshop.ma', role: 'user' }
  const adresse = { fullName: 'Salma', phone: '0612345678', address: '14 rue des Orangers', city: 'Marrakech', postalCode: '40000' }

  test('ajoute les frais de livraison sous le seuil', () => {
    expect(calculerTotaux(articles)).toEqual({ itemsPrice: 360, shippingPrice: FRAIS_LIVRAISON, totalPrice: 405 })
  })

  test('offre la livraison à partir du seuil et pour un panier vide', () => {
    expect(calculerTotaux([{ price: 1000, qty: 1 }]).shippingPrice).toBe(0)
    expect(calculerTotaux([])).toEqual({ itemsPrice: 0, shippingPrice: 0, totalPrice: 0 })
  })

  test('construit une commande payée au format du modèle Order', () => {
    const maintenant = new Date('2026-11-12T10:00:00.000Z')

    const commande = creerCommande({ id: 'cmd-1', articles, adresse, utilisateur, maintenant })

    expect(commande).toMatchObject({ _id: 'cmd-1', totalPrice: 405, isPaid: true, status: 'payée', paidAt: maintenant.toISOString() })
    expect(commande.user).toEqual({ _id: 'u2', name: 'Salma', email: 'salma@atlasshop.ma' })
    expect(commande.items[0]).toEqual({ product: 'b', name: 'Bol', image: { id: 'x', alt: 'Bol' }, price: 180, qty: 2 })
  })

  test('une commande non payée reste en attente', () => {
    const commande = creerCommande({ id: 'cmd-2', articles, adresse, utilisateur, payee: false })

    expect(commande).toMatchObject({ isPaid: false, paidAt: null, status: 'en attente' })
  })

  test('le chiffre d’affaires ignore les commandes impayées ou annulées', () => {
    const commandes = [
      { totalPrice: 100, isPaid: true, status: 'livrée' },
      { totalPrice: 50, isPaid: false, status: 'en attente' },
      { totalPrice: 70, isPaid: true, status: 'annulée' },
    ]

    expect(chiffreAffaires(commandes)).toBe(100)
  })

  test('formate une date et tolère une date invalide', () => {
    expect(formaterDate('2026-11-03T09:40:00.000Z')).toContain('2026')
    expect(formaterDate('pas une date')).toBe('—')
  })
})

describe('validation', () => {
  test('accepte une connexion valide', () => {
    expect(estValide(validerConnexion({ email: 'salma@atlasshop.ma', password: 'secret1' }))).toBe(true)
  })

  test('signale un e-mail invalide et un mot de passe trop court', () => {
    expect(Object.keys(validerConnexion({ email: 'salma@', password: '123' }))).toEqual(['email', 'password'])
  })

  test('exige un nom et deux mots de passe identiques à l’inscription', () => {
    const erreurs = validerInscription({ name: ' ', email: 'a@b.ma', password: 'secret1', confirmation: 'secret2' })

    expect(Object.keys(erreurs)).toEqual(['name', 'confirmation'])
  })

  test('valide une adresse marocaine complète', () => {
    const adresse = { fullName: 'Salma B.', phone: '06 12 34 56 78', address: '14 rue des Orangers', city: 'Marrakech', postalCode: '40000' }

    expect(validerAdresse(adresse)).toEqual({})
    expect(validerAdresse({ ...adresse, phone: '+212612345678' })).toEqual({})
  })

  test('refuse un téléphone et un code postal mal formés', () => {
    const erreurs = validerAdresse({ fullName: 'S', phone: '12345', address: 'rue', city: '', postalCode: '4000' })

    expect(Object.keys(erreurs)).toEqual(['fullName', 'phone', 'address', 'city', 'postalCode'])
  })

  test('valide un produit et refuse prix nul ou stock négatif', () => {
    const produit = { name: 'Bol', price: '180', stock: '3', category: 'poterie', description: 'Bol en céramique de Safi.' }

    expect(validerProduit(produit)).toEqual({})
    expect(Object.keys(validerProduit({ ...produit, price: '0', stock: '-1' }))).toEqual(['price', 'stock'])
  })

  test('valide un avis', () => {
    expect(validerAvis({ rating: '5', comment: 'Très belle pièce.' })).toEqual({})
    expect(Object.keys(validerAvis({ rating: '9', comment: 'ok' }))).toEqual(['rating', 'comment'])
  })
})

describe('stockage et images', () => {
  const stockage = (valeur) => ({ getItem: () => valeur, setItem: () => undefined })

  test('lit une valeur valide, sinon retourne la valeur par défaut', () => {
    expect(lireStockage('cle', Array.isArray, [], stockage('[1,2]'))).toEqual([1, 2])
    expect(lireStockage('cle', Array.isArray, [], stockage('{"a":1}'))).toEqual([])
    expect(lireStockage('cle', Array.isArray, [], stockage('{corrompu'))).toEqual([])
    expect(lireStockage('cle', Array.isArray, [], stockage(null))).toEqual([])
  })

  test('signale un échec d’écriture sans lever d’exception', () => {
    const plein = { setItem: () => { throw new Error('quota') } }

    expect(ecrireStockage('cle', [1], plein)).toBe(false)
    expect(ecrireStockage('cle', [1], stockage(null))).toBe(true)
  })

  test('utilise l’URL directe d’une image importée, sinon le srcset Unsplash', () => {
    expect(sourcesPhoto({ url: 'data:image/png;base64,AAA', alt: '' })).toEqual({ src: 'data:image/png;base64,AAA' })
    expect(sourcesPhoto({ id: 'abc', alt: '' }).srcSet).toContain('photo-abc')
  })
})
