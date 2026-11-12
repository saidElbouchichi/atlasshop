import { useState } from 'react'
import { nanoid } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import Photo from '../../components/ui/Photo'
import { useToast } from '../../hooks/useToast'
import { selectNomCategorie } from '../../store/slices/categoriesSlice'
import { ajouterProduit, modifierProduit, selectProduits, supprimerProduit } from '../../store/slices/productsSlice'
import { creerSlug } from '../../utils/catalogue'
import { formaterPrix } from '../../utils/format'
import FormulaireProduit from './FormulaireProduit'

const NOUVEAU = 'nouveau'

function LigneProduit({ produit, surModification, surSuppression }) {
  const nomCategorie = useSelector(selectNomCategorie(produit.category))
  const [confirmation, setConfirmation] = useState(false)

  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <Photo image={produit.images[0]} sizes="48px" className="h-12 w-10 shrink-0 rounded object-cover" />
          <span className="font-medium">{produit.name}</span>
        </div>
      </td>
      <td>{nomCategorie}</td>
      <td className="tabular-nums">{formaterPrix(produit.price)}</td>
      <td className="tabular-nums">{produit.stock}</td>
      <td>{produit.isFeatured ? 'Oui' : '—'}</td>
      <td className="whitespace-nowrap text-right">
        {confirmation ? (
          <>
            <button type="button" onClick={() => surSuppression(produit)} className="label mr-4 text-brun underline underline-offset-4">Confirmer</button>
            <button type="button" onClick={() => setConfirmation(false)} className="label text-cuivre">Annuler</button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => surModification(produit._id)} className="label mr-4 text-ambre hover:text-brun">Modifier</button>
            <button type="button" onClick={() => setConfirmation(true)} className="label text-cuivre hover:text-brun">Supprimer</button>
          </>
        )}
      </td>
    </tr>
  )
}

// CRUD produits (local en Phase 1, API en Phase 2)
export default function ProduitsAdmin() {
  const dispatch = useDispatch()
  const toast = useToast()
  const produits = useSelector(selectProduits)
  // null : liste seule · 'nouveau' : création · sinon identifiant du produit en cours de modification
  const [edition, setEdition] = useState(null)
  const produitEdite = produits.find((produit) => produit._id === edition)

  const enregistrer = (donnees) => {
    if (produitEdite) {
      dispatch(modifierProduit({ _id: produitEdite._id, ...donnees }))
      toast('Produit mis à jour.')
    } else {
      const slugDeBase = creerSlug(donnees.name)
      const slugPris = produits.some((produit) => produit.slug === slugDeBase)
      dispatch(ajouterProduit({ _id: `p-${nanoid(6)}`, slug: slugPris ? `${slugDeBase}-${nanoid(4).toLowerCase()}` : slugDeBase, ...donnees }))
      toast('Produit créé.')
    }
    setEdition(null)
  }

  const supprimer = (produit) => {
    dispatch(supprimerProduit(produit._id))
    toast(`« ${produit.name} » a été supprimé.`, 'info')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-[24px] tracking-[-0.02em]">Produits · {produits.length}</h2>
        {edition === null && <button type="button" onClick={() => setEdition(NOUVEAU)} className="btn btn-plein">Nouveau produit</button>}
      </div>

      {edition !== null && (
        <FormulaireProduit key={edition} produit={produitEdite} surEnregistrement={enregistrer} surAnnulation={() => setEdition(null)} />
      )}

      <div className="overflow-x-auto">
        <table className="tableau min-w-[720px]">
          <thead>
            <tr>
              <th scope="col">Produit</th>
              <th scope="col">Catégorie</th>
              <th scope="col">Prix</th>
              <th scope="col">Stock</th>
              <th scope="col">Vedette</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {produits.map((produit) => (
              <LigneProduit key={produit._id} produit={produit} surModification={setEdition} surSuppression={supprimer} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
