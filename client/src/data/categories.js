// Catégories mockées (Phase 1). Même forme que le futur modèle Category.
export const categories = [
  { _id: 'c1', name: 'Tapis', slug: 'tapis', image: { id: '1736794781980-ffc08f14c528', alt: 'Tapis berbère en laine écrue à fines lignes noires' } },
  { _id: 'c2', name: 'Poterie', slug: 'poterie', image: { id: '1618722060945-b87f7326995b', alt: 'Amphore en terre cuite sur fond brun' } },
  { _id: 'c3', name: 'Cuir', slug: 'cuir', image: { id: '1600857062241-98e5dba7f214', alt: 'Sac besace en cuir fauve' } },
  { _id: 'c4', name: 'Cosmétiques naturels', slug: 'cosmetiques', image: { id: '1608571423539-e951b9b3871e', alt: "Flacon ambré d'huile d'argan" } },
  { _id: 'c5', name: 'Décoration', slug: 'decoration', image: { id: '1778486897678-b0bd710edf5a', alt: 'Lanterne marocaine en métal ajouré' } },
]

export function nomCategorie(slug) {
  return categories.find((categorie) => categorie.slug === slug)?.name ?? slug
}
