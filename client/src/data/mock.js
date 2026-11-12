// Données mockées de la Phase 1 : utilisateurs de démo, avis, commandes et artisans.
// Elles seront remplacées par l'API (MongoDB) en Phase 2.

export const utilisateursDemo = [
  { _id: 'u1', name: 'Admin Atlas', email: 'admin@atlasshop.ma', role: 'admin', createdAt: '2026-01-12' },
  { _id: 'u2', name: 'Salma Bennani', email: 'salma@atlasshop.ma', role: 'user', createdAt: '2026-03-04' },
  { _id: 'u3', name: 'Youssef El Amrani', email: 'youssef@exemple.ma', role: 'user', createdAt: '2026-05-21' },
  { _id: 'u4', name: 'Inès Tazi', email: 'ines@exemple.ma', role: 'user', createdAt: '2026-08-02' },
]

// Avis par identifiant de produit
export const avisParProduit = {
  p1: [
    { user: 'u3', name: 'Youssef E.', rating: 5, comment: 'Laine épaisse et très douce, le tapis est encore plus beau en vrai.' },
    { user: 'u4', name: 'Inès T.', rating: 5, comment: 'Livré roulé et bien protégé. On sent le travail fait main.' },
  ],
  p2: [{ user: 'u3', name: 'Youssef E.', rating: 5, comment: 'La pièce maîtresse de notre salon. Conseils WhatsApp très utiles pour la taille.' }],
  p3: [{ user: 'u4', name: 'Inès T.', rating: 5, comment: 'Les touches safran illuminent la pièce. Magnifique.' }],
  p4: [{ user: 'u3', name: 'Youssef E.', rating: 4, comment: 'Belle terre brute, légèrement plus petite que je l’imaginais.' }],
  p7: [{ user: 'u4', name: 'Inès T.', rating: 5, comment: 'Cuir superbe, les coutures sont impeccables.' }],
  p9: [{ user: 'u3', name: 'Youssef E.', rating: 5, comment: 'Une huile pure, sans odeur ajoutée. Je recommande.' }],
}

export const temoignages = [
  {
    nom: 'Kenza A.',
    ville: 'Casablanca',
    note: 5,
    texte: 'Le tapis Beni Ouarain a transformé notre salon. On m’a conseillée sur WhatsApp pour choisir la bonne taille.',
  },
  {
    nom: 'Mehdi R.',
    ville: 'Rabat',
    note: 5,
    texte: 'Emballage soigné, livraison en deux jours et un tajine qui cuisine vraiment mieux que l’ancien.',
  },
  {
    nom: 'Sofia L.',
    ville: 'Tanger',
    note: 5,
    texte: 'J’ai offert la besace Médina : le cuir sent bon l’atelier, et la carte signée par l’artisan fait toute la différence.',
  },
]

const adresseSalma = {
  fullName: 'Salma Bennani',
  phone: '0612345678',
  address: '14 rue des Orangers, Guéliz',
  city: 'Marrakech',
  postalCode: '40000',
}

const articleDemo = (id, name, imageId, price, qty) => ({
  product: id,
  name,
  image: { id: imageId, alt: name },
  price,
  qty,
})

export const commandesDemo = [
  {
    _id: 'cmd-1001',
    user: { _id: 'u2', name: 'Salma Bennani', email: 'salma@atlasshop.ma' },
    items: [articleDemo('p7', 'Besace Médina', '1600857062241-98e5dba7f214', 1250, 1)],
    shippingAddress: adresseSalma,
    itemsPrice: 1250,
    shippingPrice: 0,
    totalPrice: 1250,
    isPaid: true,
    paidAt: '2026-10-02T10:20:00.000Z',
    status: 'livrée',
    createdAt: '2026-10-02T10:18:00.000Z',
  },
  {
    _id: 'cmd-1002',
    user: { _id: 'u3', name: 'Youssef El Amrani', email: 'youssef@exemple.ma' },
    items: [
      articleDemo('p1', 'Tapis Beni Ouarain S', '1736794781980-ffc08f14c528', 3400, 1),
      articleDemo('p9', "Huile d'argan pure", '1608571423539-e951b9b3871e', 240, 2),
    ],
    shippingAddress: { fullName: 'Youssef El Amrani', phone: '0661223344', address: '8 avenue Hassan II', city: 'Fès', postalCode: '30000' },
    itemsPrice: 3880,
    shippingPrice: 0,
    totalPrice: 3880,
    isPaid: true,
    paidAt: '2026-10-19T15:02:00.000Z',
    status: 'expédiée',
    createdAt: '2026-10-19T15:00:00.000Z',
  },
  {
    _id: 'cmd-1003',
    user: { _id: 'u4', name: 'Inès Tazi', email: 'ines@exemple.ma' },
    items: [articleDemo('p6', 'Tajine de Salé', '1706793986649-5c6516491489', 320, 2)],
    shippingAddress: { fullName: 'Inès Tazi', phone: '0677889900', address: '3 rue Ibn Sina, Agdal', city: 'Rabat', postalCode: '10090' },
    itemsPrice: 640,
    shippingPrice: 45,
    totalPrice: 685,
    isPaid: true,
    paidAt: '2026-11-03T09:41:00.000Z',
    status: 'payée',
    createdAt: '2026-11-03T09:40:00.000Z',
  },
  {
    _id: 'cmd-1004',
    user: { _id: 'u2', name: 'Salma Bennani', email: 'salma@atlasshop.ma' },
    items: [articleDemo('p10', 'Savons du Rif', '1618840152526-92682643af2d', 95, 3)],
    shippingAddress: adresseSalma,
    itemsPrice: 285,
    shippingPrice: 45,
    totalPrice: 330,
    isPaid: false,
    paidAt: null,
    status: 'en attente',
    createdAt: '2026-11-09T18:12:00.000Z',
  },
]

export const artisans = [
  {
    nom: 'Fatima Aït Ouakrim',
    metier: 'Tisseuse',
    lieu: 'Azilal, Haut Atlas',
    texte:
      "Fatima a appris le nouage auprès de sa mère, à douze ans. Elle tisse sans modèle : chaque losange raconte une saison, une naissance, un souvenir. Un grand tapis lui demande six semaines de travail.",
    image: { id: '1617694820985-a5476fe22722', alt: 'Mains d’une tisseuse nouant un tapis sur un métier traditionnel' },
  },
  {
    nom: 'Hassan El Fakhari',
    metier: 'Potier',
    lieu: 'Vallée du Drâa',
    texte:
      "Dans l'atelier familial, Hassan tourne la terre rouge de la vallée comme son père et son grand-père avant lui. Ses pièces sèchent au soleil avant de cuire deux jours dans un four à bois.",
    image: { id: '1611013621103-91e10668a120', alt: 'Mains d’un potier façonnant un pot en terre sur un tour' },
  },
  {
    nom: 'Youssef Benjelloun',
    metier: 'Maroquinier',
    lieu: 'Médina de Fès',
    texte:
      "Youssef coupe, assemble et coud chaque sac à la main, dans un cuir tanné végétal aux tanneries Chouara. Il signe l'intérieur de chacune de ses pièces.",
    image: { id: '1793502618517-e888f447ee42', alt: 'Artisan maroquinier découpant une pièce de cuir à l’établi' },
  },
]

export const chiffresMaison = [
  { valeur: 120, suffixe: '+', texte: 'Artisans partenaires' },
  { valeur: 12, suffixe: '', texte: 'Régions du Maroc' },
  { valeur: 9, suffixe: '', texte: 'Coopératives féminines' },
  { valeur: 100, suffixe: ' %', texte: 'Pièces faites main' },
]
