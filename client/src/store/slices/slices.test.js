import { describe, expect, test } from 'vitest'
import authReducer, { chargerSession, chargerUtilisateurs, connexion, deconnexion, modifierRole } from './authSlice'
import categoriesReducer, { chargerCategories, creerCategorie, effacerCategorie, majCategorie, selectNomCategorie } from './categoriesSlice'
import ordersReducer, { chargerCommande, chargerMesCommandes, idClient, majStatut, passerCommande } from './ordersSlice'
import productsReducer, {
  chargerProduits,
  creerProduit,
  effacerProduit,
  envoyerAvis,
  majProduit,
  selectProduitsVedettes,
} from './productsSlice'
import uiReducer, { afficherToast, ouvrirMenu, ouvrirPanier, retirerToast } from './uiSlice'

// Les reducers sont testés avec les actions que les thunks émettent quand l'API répond.
const initial = (reducer) => reducer(undefined, { type: '@@init' })
const reussi = (thunk, charge) => thunk.fulfilled(charge, 'requete-test')
const echoue = (thunk, charge) => thunk.rejected(null, 'requete-test', undefined, charge)

const bol = { _id: 'a1', name: 'Bol', slug: 'bol', price: 180, isFeatured: false, rating: 0, numReviews: 0, reviews: [] }
const tapis = { _id: 'a2', name: 'Tapis', slug: 'tapis', price: 3400, isFeatured: true, rating: 4.9, numReviews: 3, reviews: [] }

describe('productsSlice', () => {
  const charge = productsReducer(initial(productsReducer), reussi(chargerProduits, [bol, tapis]))

  test('suit le chargement du catalogue', () => {
    const enCours = productsReducer(initial(productsReducer), chargerProduits.pending('requete-test'))
    const enEchec = productsReducer(enCours, echoue(chargerProduits, { message: 'Serveur injoignable.' }))

    expect(initial(productsReducer)).toMatchObject({ items: [], status: 'idle' })
    expect(enCours.status).toBe('loading')
    expect(charge).toMatchObject({ status: 'succeeded', items: [bol, tapis] })
    expect(enEchec).toMatchObject({ status: 'failed', error: 'Serveur injoignable.' })
  })

  test('ajoute, remplace puis retire un produit', () => {
    const theiere = { ...bol, _id: 'a3', name: 'Théière', slug: 'theiere' }
    const ajoute = productsReducer(charge, reussi(creerProduit, theiere))
    const modifie = productsReducer(ajoute, reussi(majProduit, { ...theiere, price: 450 }))
    const retire = productsReducer(modifie, reussi(effacerProduit, 'a3'))

    expect(ajoute.items[0]).toEqual(theiere)
    expect(modifie.items[0].price).toBe(450)
    expect(retire.items.map((produit) => produit._id)).toEqual(['a1', 'a2'])
  })

  test('un avis remplace le produit par sa version renvoyée par l’API', () => {
    const note = { ...bol, rating: 4, numReviews: 1, reviews: [{ _id: 'r1', user: 'u2', name: 'Salma', rating: 4, comment: 'Très joli.' }] }

    const apres = productsReducer(charge, reussi(envoyerAvis, note))

    expect(apres.items[0]).toEqual(note)
    expect(apres.items[1]).toBe(charge.items[1])
  })

  test('le sélecteur des vedettes est mémoïsé', () => {
    const etat = { products: charge }

    expect(selectProduitsVedettes(etat)).toEqual([tapis])
    expect(selectProduitsVedettes(etat)).toBe(selectProduitsVedettes(etat))
  })
})

describe('categoriesSlice', () => {
  test('charge, ajoute, renomme et supprime une catégorie', () => {
    const chargees = categoriesReducer(initial(categoriesReducer), reussi(chargerCategories, [{ _id: 'c1', name: 'Cuir', slug: 'cuir' }]))
    const ajoutee = categoriesReducer(chargees, reussi(creerCategorie, { _id: 'c2', name: 'Bijoux', slug: 'bijoux' }))
    const renommee = categoriesReducer(ajoutee, reussi(majCategorie, { _id: 'c2', name: 'Bijoux berbères', slug: 'bijoux' }))
    const supprimee = categoriesReducer(renommee, reussi(effacerCategorie, 'c2'))

    expect(selectNomCategorie('bijoux')({ categories: renommee })).toBe('Bijoux berbères')
    expect(selectNomCategorie('bijoux')({ categories: supprimee })).toBe('bijoux')
    expect(supprimee.items).toHaveLength(1)
  })
})

describe('ordersSlice', () => {
  const commande = { _id: 'o1', user: 'u2', totalPrice: 405, isPaid: false, status: 'en attente', items: [] }

  test('enregistre la commande passée puis sa version payée, sans doublon', () => {
    const passee = ordersReducer(initial(ordersReducer), reussi(passerCommande, { commande, url: '/confirmation/o1', simule: true }))
    const payee = ordersReducer(passee, reussi(chargerCommande, { ...commande, isPaid: true, status: 'payée' }))

    expect(passee.items).toEqual([commande])
    expect(payee.items).toHaveLength(1)
    expect(payee.items[0]).toMatchObject({ isPaid: true, status: 'payée' })
  })

  test('remplace la liste au chargement et met à jour un statut', () => {
    const chargees = ordersReducer(initial(ordersReducer), reussi(chargerMesCommandes, [commande]))
    const expediee = ordersReducer(chargees, reussi(majStatut, { ...commande, status: 'expédiée' }))

    expect(expediee.items[0].status).toBe('expédiée')
  })

  test('retrouve le client, que « user » soit un identifiant ou un objet', () => {
    expect(idClient({ user: 'u2' })).toBe('u2')
    expect(idClient({ user: { _id: 'u2', name: 'Salma' } })).toBe('u2')
    expect(idClient({ user: null })).toBeNull()
  })
})

describe('authSlice', () => {
  const salma = { _id: 'u2', name: 'Salma Bennani', email: 'salma@atlasshop.ma', role: 'user' }

  test('ouvre puis ferme la session', () => {
    const connecte = authReducer(initial(authReducer), reussi(connexion, salma))
    const deconnecte = authReducer(connecte, reussi(deconnexion, null))

    expect(connecte).toMatchObject({ user: salma, statut: 'pret' })
    expect(deconnecte.user).toBeNull()
  })

  test('une session invalide laisse l’utilisateur déconnecté et prêt', () => {
    const etat = authReducer({ user: null, statut: 'verification', users: [] }, echoue(chargerSession, { status: 401 }))

    expect(etat).toMatchObject({ user: null, statut: 'pret' })
  })

  test('charge les utilisateurs et met à jour un rôle', () => {
    const charges = authReducer(initial(authReducer), reussi(chargerUtilisateurs, [salma]))
    const promue = authReducer(charges, reussi(modifierRole, { ...salma, role: 'admin' }))

    expect(promue.users[0].role).toBe('admin')
  })
})

describe('uiSlice', () => {
  test('ouvrir le panier ferme le menu', () => {
    const etat = uiReducer(uiReducer(initial(uiReducer), ouvrirMenu()), ouvrirPanier())

    expect(etat).toMatchObject({ menuOuvert: false, panierOuvert: true })
  })

  test('affiche puis retire un toast', () => {
    const avecToast = uiReducer(initial(uiReducer), afficherToast('Bravo', 'succes'))
    const [toast] = avecToast.toasts

    expect(toast).toMatchObject({ message: 'Bravo', type: 'succes' })
    expect(uiReducer(avecToast, retirerToast(toast.id)).toasts).toEqual([])
  })
})
