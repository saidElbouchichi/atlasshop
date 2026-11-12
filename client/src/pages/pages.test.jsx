import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import App from '../App'
import { categories } from '../data/categories'
import { commandesDemo, utilisateursDemo } from '../data/mock'
import { products } from '../data/products'
import { creerStore, reducerRacine } from '../store'

// Test de fumée : chaque route doit se rendre sans erreur et afficher son contenu clé.
// Le store est pré-rempli avec des données d'exemple, comme si l'API avait déjà répondu
// (le contrôle d'accès réel est testé côté serveur, dans server/tests).
const [admin, cliente] = utilisateursDemo

function rendre(chemin, { utilisateur = null, statutProduits = 'succeeded' } = {}) {
  const etatDeBase = reducerRacine(undefined, { type: '@@init' })
  const store = creerStore({
    ...etatDeBase,
    auth: { user: utilisateur, statut: 'pret', users: utilisateursDemo },
    categories: { items: categories },
    orders: { items: commandesDemo },
    products: {
      items: statutProduits === 'succeeded' ? products.map((produit) => ({ ...produit, reviews: [] })) : [],
      status: statutProduits,
      error: null,
    },
  })
  const html = renderToString(
    <Provider store={store}>
      <MemoryRouter initialEntries={[chemin]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </MemoryRouter>
    </Provider>,
  )
  return html.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/\s+/g, ' ')
}

describe('pages publiques', () => {
  test.each([
    ['/', 'Choisissez votre pièce'],
    ['/catalogue', 'Toute la collection'],
    ['/catalogue?category=cuir&sort=prix-asc', 'Toute la collection'],
    ['/produit/amphore-zagora', 'Amphore Zagora'],
    ['/artisans', 'Fatima Aït Ouakrim'],
    ['/a-propos', 'Said El Bouchichi'],
    ['/panier', 'Votre panier est vide'],
    ['/connexion', 'Heureux de vous revoir'],
    ['/inscription', 'Créer un compte'],
  ])('%s se rend sans erreur', (chemin, texteAttendu) => {
    expect(rendre(chemin)).toContain(texteAttendu)
  })

  test('une adresse inconnue ou un produit inexistant affichent la page 404', () => {
    expect(rendre('/nimporte-quoi')).toContain('Erreur 404')
    expect(rendre('/produit/inexistant')).toContain('Erreur 404')
  })

  test('la fiche produit patiente tant que le catalogue charge, et l’accueil se rend sans produits', () => {
    expect(rendre('/produit/amphore-zagora', { statutProduits: 'loading' })).toContain('Chargement de la pièce')
    expect(rendre('/', { statutProduits: 'loading' })).toContain('Tapis Beni Ouarain')
  })
})

describe('pages protégées', () => {
  test('le profil n’affiche que les commandes de la cliente connectée', () => {
    const html = rendre('/profil', { utilisateur: cliente })

    expect(html).toContain('Bonjour, Salma')
    expect(html).toContain('#D-1001')
    expect(html).not.toContain('#D-1002')
  })

  test('la confirmation affiche la commande et son état de paiement', () => {
    expect(rendre('/confirmation/cmd-1001', { utilisateur: cliente })).toContain('votre commande est confirmée')
    expect(rendre('/confirmation/cmd-1004', { utilisateur: cliente })).toContain('paiement en attente')
    expect(rendre('/confirmation/inconnue', { utilisateur: cliente })).toContain('Chargement de la commande')
  })

  test.each([
    ['/admin', 'Dernières commandes'],
    ['/admin/produits', 'Nouveau produit'],
    ['/admin/categories', 'Nouvelle catégorie'],
    ['/admin/commandes', '#D-1004'],
    ['/admin/utilisateurs', 'salma@atlasshop.ma'],
  ])('%s se rend pour un admin', (chemin, texteAttendu) => {
    expect(rendre(chemin, { utilisateur: admin })).toContain(texteAttendu)
  })

  test('l’admin est fermé aux visiteurs et aux clients', () => {
    expect(rendre('/admin')).not.toContain('Gestion de la boutique')
    expect(rendre('/admin', { utilisateur: cliente })).not.toContain('Gestion de la boutique')
  })
})
