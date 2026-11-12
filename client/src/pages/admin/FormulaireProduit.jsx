import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Champ } from '../../components/ui/Formulaire'
import Photo from '../../components/ui/Photo'
import { useFormulaire } from '../../hooks/useFormulaire'
import { useToast } from '../../hooks/useToast'
import { messageErreur, requete } from '../../services/api'
import { selectCategories } from '../../store/slices/categoriesSlice'
import { cleImage } from '../../utils/images'
import { validerProduit } from '../../utils/validation'

const TAILLE_MAX_IMAGE = 2 * 1024 * 1024
const TYPES_IMAGE = ['image/jpeg', 'image/png', 'image/webp']
const NOMBRE_MAX_IMAGES = 6
const SPECS_PAR_DEFAUT = [
  { label: 'Dimensions', value: '' },
  { label: 'Matière', value: '' },
  { label: 'Origine', value: '' },
  { label: 'Fait main', value: 'Oui' },
]

const MOTIF_URL_HTTPS = /^https:\/\/\S+$/

// POST /api/upload : les fichiers partent vers Cloudinary, l'API renvoie leurs URL
async function televerser(fichiers) {
  const formulaire = new FormData()
  fichiers.forEach((fichier) => formulaire.append('images', fichier))
  return (await requete({ url: '/upload', method: 'post', data: formulaire })).data
}

// Éditeur des caractéristiques (specs) : lignes label / valeur
function EditeurSpecs({ specs, surChangement }) {
  const modifier = (position, cle, valeur) =>
    surChangement(specs.map((spec, rang) => (rang === position ? { ...spec, [cle]: valeur } : spec)))

  return (
    <fieldset>
      <legend className="label mb-2 text-cuivre">Caractéristiques</legend>
      <ul className="space-y-2">
        {specs.map((spec, position) => (
          // eslint-disable-next-line react/no-array-index-key -- les lignes n'ont pas d'identifiant propre
          <li key={position} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input aria-label={`Label de la caractéristique ${position + 1}`} value={spec.label} onChange={(e) => modifier(position, 'label', e.target.value)} placeholder="Label" className="champ-compact" />
            <input aria-label={`Valeur de la caractéristique ${position + 1}`} value={spec.value} onChange={(e) => modifier(position, 'value', e.target.value)} placeholder="Valeur" className="champ-compact" />
            <button type="button" onClick={() => surChangement(specs.filter((_, rang) => rang !== position))} aria-label={`Supprimer la caractéristique ${position + 1}`} className="champ-compact hover:border-brun">
              ×
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => surChangement([...specs, { label: '', value: '' }])} className="lien-ambre mt-3">
        Ajouter une ligne
      </button>
    </fieldset>
  )
}

// Images du produit : envoi vers Cloudinary (multer côté API), ou ajout d'une image déjà en ligne par son URL.
function EditeurImages({ images, nomProduit, surChangement }) {
  const toast = useToast()
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [urlSaisie, setUrlSaisie] = useState('')
  const complet = images.length >= NOMBRE_MAX_IMAGES

  const importer = async (evenement) => {
    const fichiers = Array.from(evenement.target.files ?? [])
    evenement.target.value = ''
    const acceptes = fichiers.filter((fichier) => TYPES_IMAGE.includes(fichier.type) && fichier.size <= TAILLE_MAX_IMAGE)
    if (acceptes.length < fichiers.length) toast('Images JPG, PNG ou WebP de 2 Mo maximum.', 'erreur')
    if (acceptes.length === 0) return
    setEnvoiEnCours(true)
    try {
      const envoyees = await televerser(acceptes)
      const nouvelles = envoyees.map(({ url, publicId }) => ({ url, publicId, alt: nomProduit || 'Photo du produit' }))
      surChangement([...images, ...nouvelles].slice(0, NOMBRE_MAX_IMAGES))
    } catch (erreur) {
      toast(messageErreur(erreur), 'erreur')
    } finally {
      setEnvoiEnCours(false)
    }
  }

  const ajouterParUrl = () => {
    const url = urlSaisie.trim()
    if (!MOTIF_URL_HTTPS.test(url)) return toast('Saisissez une adresse d’image commençant par https://', 'erreur')
    if (images.some((image) => image.url === url)) return toast('Cette image est déjà dans la liste.', 'erreur')
    surChangement([...images, { url, alt: nomProduit || 'Photo du produit' }].slice(0, NOMBRE_MAX_IMAGES))
    return setUrlSaisie('')
  }

  return (
    <fieldset>
      <legend className="label mb-2 text-cuivre">Images ({images.length} / {NOMBRE_MAX_IMAGES})</legend>
      <ul className="flex flex-wrap gap-2">
        {images.map((image) => (
          <li key={cleImage(image)} className="relative h-20 w-20 overflow-hidden rounded border border-sable">
            <Photo image={image} sizes="80px" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => surChangement(images.filter((autre) => autre !== image))}
              aria-label="Retirer cette image"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brun text-[12px] leading-none text-creme"
            >
              ×
            </button>
          </li>
        ))}
        {!complet && (
          <li>
            <label className="label flex h-20 w-20 cursor-pointer items-center justify-center rounded border border-dashed border-cuivre text-center text-cuivre transition-colors hover:border-brun hover:text-brun">
              {envoiEnCours ? 'Envoi…' : 'Ajouter'}
              <input type="file" accept={TYPES_IMAGE.join(',')} multiple disabled={envoiEnCours} onChange={importer} className="sr-only" />
            </label>
          </li>
        )}
      </ul>
      {!complet && (
        <div className="mt-3 flex gap-2">
          <input
            type="url"
            aria-label="Adresse d'une image en ligne"
            value={urlSaisie}
            onChange={(evenement) => setUrlSaisie(evenement.target.value)}
            placeholder="ou coller une adresse https://…"
            className="champ-compact min-w-0 flex-1"
          />
          <button type="button" onClick={ajouterParUrl} className="champ-compact hover:border-brun">
            OK
          </button>
        </div>
      )}
    </fieldset>
  )
}

/** Formulaire de création / modification d'un produit (admin). */
export default function FormulaireProduit({ produit, surEnregistrement, surAnnulation }) {
  const categories = useSelector(selectCategories)
  const [specs, setSpecs] = useState(produit?.specs ?? SPECS_PAR_DEFAUT)
  const [images, setImages] = useState(produit?.images ?? [])
  const [isFeatured, setIsFeatured] = useState(produit?.isFeatured ?? false)
  const [erreurImages, setErreurImages] = useState('')

  const enregistrer = (valeurs) => {
    if (images.length === 0) {
      setErreurImages('Ajoutez au moins une image.')
      return
    }
    surEnregistrement({
      name: valeurs.name.trim(),
      subtitle: valeurs.subtitle.trim(),
      description: valeurs.description.trim(),
      artisan: valeurs.artisan.trim(),
      category: valeurs.category,
      price: Number(valeurs.price),
      stock: Number(valeurs.stock),
      specs: specs.filter((spec) => spec.label.trim() && spec.value.trim()),
      images,
      isFeatured,
    })
  }

  const { champ, soumettre } = useFormulaire(
    {
      name: produit?.name ?? '',
      subtitle: produit?.subtitle ?? '',
      description: produit?.description ?? '',
      artisan: produit?.artisan ?? '',
      category: produit?.category ?? '',
      price: produit?.price ?? '',
      stock: produit?.stock ?? '',
    },
    validerProduit,
    enregistrer,
  )

  return (
    <form onSubmit={soumettre} noValidate className="grid gap-5 border border-sable bg-beige p-6 lg:grid-cols-2 xl:p-8">
      <h2 className="text-[24px] tracking-[-0.02em] lg:col-span-2">{produit ? `Modifier « ${produit.name} »` : 'Nouveau produit'}</h2>
      <Champ label="Nom" {...champ('name')} />
      <Champ label="Sous-titre" {...champ('subtitle')} />
      <Champ label="Prix (MAD)" type="number" min="0" step="1" {...champ('price')} />
      <Champ label="Stock" type="number" min="0" step="1" {...champ('stock')} />
      <Champ label="Catégorie" as="select" {...champ('category')}>
        <option value="">Choisir…</option>
        {categories.map((categorie) => (
          <option key={categorie._id} value={categorie.slug}>{categorie.name}</option>
        ))}
      </Champ>
      <Champ label="Artisan" {...champ('artisan')} />
      <Champ label="Description" as="textarea" className="lg:col-span-2" {...champ('description')} />
      <EditeurSpecs specs={specs} surChangement={setSpecs} />
      <div>
        <EditeurImages
          images={images}
          nomProduit={champ('name').value}
          surChangement={(suivantes) => {
            setImages(suivantes)
            setErreurImages('')
          }}
        />
        {erreurImages && <p role="alert" className="mt-1.5 text-[13px] text-cuivre">{erreurImages}</p>}
        <label className="mt-6 flex cursor-pointer items-center gap-3">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 accent-[#EC9226]" />
          <span className="label">Produit vedette (affiché sur l'accueil)</span>
        </label>
      </div>
      <div className="flex flex-wrap gap-3 lg:col-span-2">
        <button type="submit" className="btn btn-plein">Enregistrer</button>
        <button type="button" onClick={surAnnulation} className="btn btn-contour">Annuler</button>
      </div>
    </form>
  )
}
