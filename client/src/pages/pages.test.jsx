import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test } from 'vitest'
import App from '../App'
import { utilisateursDemo } from '../data/mock'
import { creerStore, reducerRacine } from '../store'

// Test de fumée : chaque route doit se rendre côté serveur sans erreur et afficher son contenu clé.
const [admin, cliente] = utilisateursDemo

function rendre(chemin, utilisateur = null) {
  const etatDeBase = reducerRacine(undefined, { type: '@@init' })
  const store = creerStore({ ...etatDeBase, auth: { ...etatDeBase.auth, user: utilisateur } })
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
})

describe('pages protégées', () => {
  test('le profil affiche les commandes de la cliente connectée', () => {
    const html = rendre('/profil', cliente)

    expect(html).toContain('Bonjour, Salma')
    expect(html).toContain('cmd-1001')
    expect(html).not.toContain('cmd-1002')
  })

  test('la confirmation n’est visible que par la propriétaire ou un admin', () => {
    expect(rendre('/confirmation/cmd-1001', cliente)).toContain('votre commande est confirmée')
    expect(rendre('/confirmation/cmd-1002', cliente)).toContain('Erreur 404')
    expect(rendre('/confirmation/cmd-1002', admin)).toContain('votre commande est confirmée')
  })

  test.each([
    ['/admin', 'Dernières commandes'],
    ['/admin/produits', 'Nouveau produit'],
    ['/admin/categories', 'Nouvelle catégorie'],
    ['/admin/commandes', 'cmd-1004'],
    ['/admin/utilisateurs', 'salma@atlasshop.ma'],
  ])('%s se rend pour un admin', (chemin, texteAttendu) => {
    expect(rendre(chemin, admin)).toContain(texteAttendu)
  })

  test('l’admin est fermé aux visiteurs et aux clients', () => {
    expect(rendre('/admin')).not.toContain('Gestion de la boutique')
    expect(rendre('/admin', cliente)).not.toContain('Gestion de la boutique')
  })
})
