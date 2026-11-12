// Règles de commande partagées entre le panier, le checkout et l'admin

export const SEUIL_LIVRAISON_OFFERTE = 1000
export const FRAIS_LIVRAISON = 45

export const STATUTS_COMMANDE = ['en attente', 'payée', 'expédiée', 'livrée', 'annulée']

export function calculerTotaux(articles) {
  const itemsPrice = articles.reduce((total, article) => total + article.price * article.qty, 0)
  const livraisonOfferte = itemsPrice === 0 || itemsPrice >= SEUIL_LIVRAISON_OFFERTE
  const shippingPrice = livraisonOfferte ? 0 : FRAIS_LIVRAISON
  return { itemsPrice, shippingPrice, totalPrice: itemsPrice + shippingPrice }
}

/**
 * Construit une commande au format du futur modèle Order.
 * @param {{ id: string, articles: object[], adresse: object, utilisateur: object, payee?: boolean, maintenant?: Date }} donnees
 */
export function creerCommande({ id, articles, adresse, utilisateur, payee = true, maintenant = new Date() }) {
  const horodatage = maintenant.toISOString()
  return {
    _id: id,
    user: { _id: utilisateur._id, name: utilisateur.name, email: utilisateur.email },
    items: articles.map(({ product, name, image, price, qty }) => ({ product, name, image, price, qty })),
    shippingAddress: { ...adresse },
    ...calculerTotaux(articles),
    isPaid: payee,
    paidAt: payee ? horodatage : null,
    status: payee ? 'payée' : 'en attente',
    createdAt: horodatage,
  }
}

export function chiffreAffaires(commandes) {
  return commandes
    .filter((commande) => commande.isPaid && commande.status !== 'annulée')
    .reduce((total, commande) => total + commande.totalPrice, 0)
}

export function formaterDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}
