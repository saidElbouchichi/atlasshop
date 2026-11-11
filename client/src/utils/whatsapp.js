// Numéro de la boutique lu depuis l'environnement (voir .env.example)
const NUMERO = import.meta.env?.VITE_WHATSAPP_NUMBER || '212600000000'

const MESSAGE_PAR_DEFAUT = 'Bonjour AtlasShop, je souhaite un conseil pour choisir une pièce.'

// Construit un lien WhatsApp avec un message pré-rempli
export function lienWhatsApp(message = MESSAGE_PAR_DEFAUT) {
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(message)}`
}

export function messageConseilProduit(nomProduit) {
  return `Bonjour AtlasShop, je souhaite un conseil à propos de : ${nomProduit}.`
}
