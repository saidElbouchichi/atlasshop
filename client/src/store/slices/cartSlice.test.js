import { describe, expect, test } from 'vitest'
import reducer, {
  CLE_STOCKAGE_PANIER,
  ajouterAuPanier,
  chargerPanier,
  modifierQuantite,
  retirerDuPanier,
  selectNombreArticles,
  selectSousTotal,
  viderPanier,
} from './cartSlice'

const tapis = {
  _id: 'p1',
  name: 'Tapis',
  slug: 'tapis',
  price: 3400,
  stock: 2,
  images: [{ id: 'photo-1', alt: 'Tapis' }],
}
const bol = { _id: 'p2', name: 'Bol', slug: 'bol', price: 180, stock: 30, images: [{ id: 'photo-2', alt: 'Bol' }] }

const panierVide = { items: [] }

function fauxStockage(valeur) {
  return { getItem: (cle) => (cle === CLE_STOCKAGE_PANIER ? valeur : null) }
}

describe('cartSlice', () => {
  test('ajoute un nouveau produit avec une quantité de 1 par défaut', () => {
    const etat = reducer(panierVide, ajouterAuPanier({ produit: tapis }))

    expect(etat.items).toHaveLength(1)
    expect(etat.items[0]).toMatchObject({ product: 'p1', name: 'Tapis', price: 3400, qty: 1 })
  })

  test("cumule la quantité quand le produit est déjà dans le panier", () => {
    const premier = reducer(panierVide, ajouterAuPanier({ produit: bol, qty: 2 }))

    const etat = reducer(premier, ajouterAuPanier({ produit: bol, qty: 3 }))

    expect(etat.items).toHaveLength(1)
    expect(etat.items[0].qty).toBe(5)
  })

  test('ne dépasse jamais le stock disponible', () => {
    const etat = reducer(panierVide, ajouterAuPanier({ produit: tapis, qty: 10 }))

    expect(etat.items[0].qty).toBe(2)
  })

  test('refuse un produit en rupture de stock', () => {
    const etat = reducer(panierVide, ajouterAuPanier({ produit: { ...tapis, stock: 0 } }))

    expect(etat.items).toEqual([])
  })

  test('borne la quantité modifiée entre 1 et le stock', () => {
    const depart = reducer(panierVide, ajouterAuPanier({ produit: tapis }))

    const tropBas = reducer(depart, modifierQuantite({ id: 'p1', qty: 0 }))
    const tropHaut = reducer(depart, modifierQuantite({ id: 'p1', qty: 99 }))

    expect(tropBas.items[0].qty).toBe(1)
    expect(tropHaut.items[0].qty).toBe(2)
  })

  test('retire un article puis vide le panier', () => {
    const depart = [tapis, bol].reduce(
      (etat, produit) => reducer(etat, ajouterAuPanier({ produit })),
      panierVide,
    )

    const sansTapis = reducer(depart, retirerDuPanier('p1'))
    const vide = reducer(depart, viderPanier())

    expect(sansTapis.items.map((article) => article.product)).toEqual(['p2'])
    expect(vide.items).toEqual([])
  })

  test("ne modifie pas l'état d'origine (immutabilité)", () => {
    const depart = reducer(panierVide, ajouterAuPanier({ produit: bol }))

    reducer(depart, modifierQuantite({ id: 'p2', qty: 4 }))

    expect(depart.items[0].qty).toBe(1)
  })

  test('calcule le nombre d’articles et le sous-total', () => {
    const cart = [
      { produit: tapis, qty: 2 },
      { produit: bol, qty: 3 },
    ].reduce((etat, charge) => reducer(etat, ajouterAuPanier(charge)), panierVide)

    expect(selectNombreArticles({ cart })).toBe(5)
    expect(selectSousTotal({ cart })).toBe(2 * 3400 + 3 * 180)
  })
})

describe('chargerPanier', () => {
  test('retourne un panier vide quand rien n’est stocké', () => {
    expect(chargerPanier(fauxStockage(null))).toEqual([])
  })

  test('retourne un panier vide quand le JSON est corrompu', () => {
    expect(chargerPanier(fauxStockage('{pas du json'))).toEqual([])
  })

  test('écarte les articles mal formés', () => {
    const valide = { product: 'p1', name: 'Tapis', slug: 'tapis', image: { id: 'photo-1', alt: 'Tapis' }, price: 3400, qty: 1 }
    const sansImage = { product: 'p3', name: 'Bol', slug: 'bol', price: 180, qty: 1 }
    const stocke = JSON.stringify([valide, { product: 'p2', qty: -3 }, sansImage, null, 'intrus'])

    expect(chargerPanier(fauxStockage(stocke))).toEqual([valide])
  })
})
