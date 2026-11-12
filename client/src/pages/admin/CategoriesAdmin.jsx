import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useToast } from '../../hooks/useToast'
import { messageErreur } from '../../services/api'
import { creerCategorie, effacerCategorie, majCategorie, selectCategories } from '../../store/slices/categoriesSlice'
import { selectProduits } from '../../store/slices/productsSlice'

const LONGUEUR_MIN_NOM = 2

// CRUD catégories. Une catégorie encore utilisée par des produits ne peut pas être supprimée.
export default function CategoriesAdmin() {
  const dispatch = useDispatch()
  const toast = useToast()
  const categories = useSelector(selectCategories)
  const produits = useSelector(selectProduits)
  const [nom, setNom] = useState('')
  const [edition, setEdition] = useState(null) // { _id, name } de la catégorie en cours de renommage

  const nombreProduits = (slug) => produits.filter((produit) => produit.category === slug).length

  // Exécute une action de l'API puis confirme, ou affiche le refus du serveur
  const executer = async (action, message, type) => {
    try {
      await dispatch(action).unwrap()
      toast(message, type)
      return true
    } catch (erreur) {
      toast(messageErreur(erreur), 'erreur')
      return false
    }
  }

  const ajouter = async (evenement) => {
    evenement.preventDefault()
    const propre = nom.trim()
    if (propre.length < LONGUEUR_MIN_NOM) return toast('Indiquez un nom de catégorie.', 'erreur')
    if (await executer(creerCategorie({ name: propre }), 'Catégorie créée.')) setNom('')
    return null
  }

  const renommer = async (evenement) => {
    evenement.preventDefault()
    const propre = edition.name.trim()
    if (propre.length < LONGUEUR_MIN_NOM) return toast('Indiquez un nom de catégorie.', 'erreur')
    // Le slug ne change pas : les produits y sont rattachés
    if (await executer(majCategorie({ _id: edition._id, name: propre }), 'Catégorie renommée.')) setEdition(null)
    return null
  }

  const supprimer = (categorie) => {
    if (nombreProduits(categorie.slug) > 0) return toast('Déplacez d’abord les produits de cette catégorie.', 'erreur')
    return executer(effacerCategorie(categorie._id), `« ${categorie.name} » a été supprimée.`, 'info')
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
      <div className="overflow-x-auto">
        <h2 className="mb-4 text-[24px] tracking-[-0.02em]">Catégories · {categories.length}</h2>
        <table className="tableau min-w-[480px]">
          <thead>
            <tr>
              <th scope="col">Nom</th>
              <th scope="col">Slug</th>
              <th scope="col">Produits</th>
              <th scope="col" className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((categorie) => (
              <tr key={categorie._id}>
                <td>
                  {edition?._id === categorie._id ? (
                    <form onSubmit={renommer} className="flex gap-2">
                      <input aria-label="Nouveau nom" autoFocus value={edition.name} onChange={(e) => setEdition({ ...edition, name: e.target.value })} className="champ-compact w-full" />
                      <button type="submit" className="label text-ambre">OK</button>
                    </form>
                  ) : (
                    <span className="font-medium">{categorie.name}</span>
                  )}
                </td>
                <td className="text-cuivre">{categorie.slug}</td>
                <td className="tabular-nums">{nombreProduits(categorie.slug)}</td>
                <td className="whitespace-nowrap text-right">
                  <button type="button" onClick={() => setEdition({ _id: categorie._id, name: categorie.name })} className="label mr-4 text-ambre hover:text-brun">Renommer</button>
                  <button type="button" onClick={() => supprimer(categorie)} className="label text-cuivre hover:text-brun">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={ajouter} className="h-fit border border-sable bg-beige p-6">
        <label htmlFor="nouvelle-categorie" className="label mb-2 block text-cuivre">Nouvelle catégorie</label>
        <input id="nouvelle-categorie" value={nom} onChange={(e) => setNom(e.target.value)} maxLength={40} placeholder="Ex. Bijoux" className="champ-compact h-12 w-full" />
        <button type="submit" className="btn btn-plein mt-4 w-full">Ajouter</button>
      </form>
    </div>
  )
}
