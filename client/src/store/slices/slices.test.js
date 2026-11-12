import { describe, expect, test } from 'vitest'
import authReducer, { changerRole, connecter, deconnecter, inscrire, trouverParEmail } from './authSlice'
import categoriesReducer, { ajouterCategorie, modifierCategorie, selectNomCategorie, supprimerCategorie } from './categoriesSlice'
import ordersReducer, { ajouterCommande, changerStatut } from './ordersSlice'
import productsReducer, { ajouterAvis, ajouterProduit, modifierProduit, supprimerProduit } from './productsSlice'
import uiReducer, { afficherToast, ouvrirMenu, ouvrirPanier, retirerToast } from './uiSlice'

const initial = (reducer) => reducer(undefined, { type: '@@init' })

describe('productsSlice', () => {
  const avis = { user: 'u9', name: 'Test', rating: 1, comment: 'Bof, vraiment.' }

  test('crée, modifie puis supprime un produit', () => {
    const cree = productsReducer(initial(productsReducer), ajouterProduit({ _id: 'px', name: 'Théière', slug: 'theiere', price: 300 }))
    const modifie = productsReducer(cree, modifierProduit({ _id: 'px', price: 350 }))
    const supprime = productsReducer(modifie, supprimerProduit('px'))

    expect(cree.items[0]).toMatchObject({ _id: 'px', rating: 0, numReviews: 0, reviews: [] })
    expect(modifie.items[0].price).toBe(350)
    expect(supprime.items.some((produit) => produit._id === 'px')).toBe(false)
  })

  test('un avis met à jour la note moyenne et le nombre d’avis', () => {
    const depart = initial(productsReducer)
    const avant = depart.items.find((produit) => produit._id === 'p5')

    const apres = productsReducer(depart, ajouterAvis({ productId: 'p5', avis })).items.find((produit) => produit._id === 'p5')

    expect(apres.numReviews).toBe(avant.numReviews + 1)
    expect(apres.rating).toBeLessThan(avant.rating)
    expect(apres.reviews[0]).toEqual(avis)
  })

  test('refuse un second avis du même utilisateur', () => {
    const premier = productsReducer(initial(productsReducer), ajouterAvis({ productId: 'p5', avis }))

    const second = productsReducer(premier, ajouterAvis({ productId: 'p5', avis: { ...avis, rating: 5 } }))

    expect(second).toBe(premier)
  })
})

describe('categoriesSlice', () => {
  test('ajoute, renomme et supprime une catégorie', () => {
    const ajoutee = categoriesReducer(initial(categoriesReducer), ajouterCategorie({ _id: 'cx', name: 'Bijoux', slug: 'bijoux', image: null }))
    const renommee = categoriesReducer(ajoutee, modifierCategorie({ _id: 'cx', name: 'Bijoux berbères' }))
    const supprimee = categoriesReducer(renommee, supprimerCategorie('cx'))

    expect(selectNomCategorie('bijoux')({ categories: renommee })).toBe('Bijoux berbères')
    expect(selectNomCategorie('bijoux')({ categories: supprimee })).toBe('bijoux')
  })
})

describe('ordersSlice', () => {
  const commande = { _id: 'cmd-x', items: [], totalPrice: 100, isPaid: false, paidAt: null, status: 'en attente', user: { _id: 'u2' } }

  test('ajoute la nouvelle commande en tête de liste', () => {
    expect(ordersReducer(initial(ordersReducer), ajouterCommande(commande)).items[0]._id).toBe('cmd-x')
  })

  test('passer une commande à « expédiée » la marque comme payée', () => {
    const depart = ordersReducer(initial(ordersReducer), ajouterCommande(commande))

    const expediee = ordersReducer(depart, changerStatut({ id: 'cmd-x', status: 'expédiée' })).items[0]

    expect(expediee).toMatchObject({ status: 'expédiée', isPaid: true })
    expect(expediee.paidAt).toEqual(expect.any(String))
  })

  test('ignore un statut inconnu et n’encaisse pas une commande annulée', () => {
    const depart = ordersReducer(initial(ordersReducer), ajouterCommande(commande))

    expect(ordersReducer(depart, changerStatut({ id: 'cmd-x', status: 'perdue' }))).toBe(depart)
    expect(ordersReducer(depart, changerStatut({ id: 'cmd-x', status: 'annulée' })).items[0].isPaid).toBe(false)
  })
})

describe('authSlice', () => {
  const nouveau = { _id: 'u-x', name: 'Nora', email: 'nora@exemple.ma', role: 'user' }

  test('inscrit et connecte un nouvel utilisateur, puis le déconnecte', () => {
    const inscrit = authReducer(initial(authReducer), inscrire(nouveau))

    expect(inscrit.user).toEqual(nouveau)
    expect(trouverParEmail(inscrit.users, ' NORA@exemple.ma ')).toEqual(nouveau)
    expect(authReducer(inscrit, deconnecter()).user).toBeNull()
  })

  test('connecte un compte de démo et change un rôle valide uniquement', () => {
    const depart = initial(authReducer)
    const admin = trouverParEmail(depart.users, 'admin@atlasshop.ma')

    const connecte = authReducer(depart, connecter(admin))
    const promu = authReducer(connecte, changerRole({ id: 'u2', role: 'admin' }))
    const invalide = authReducer(promu, changerRole({ id: 'u2', role: 'superadmin' }))

    expect(connecte.user.role).toBe('admin')
    expect(promu.users.find((utilisateur) => utilisateur._id === 'u2').role).toBe('admin')
    expect(invalide).toBe(promu)
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
