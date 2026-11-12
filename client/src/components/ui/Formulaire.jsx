import { useId } from 'react'

const CLASSE_CHAMP =
  'w-full rounded border bg-transparent px-4 text-[15px] placeholder:text-cuivre/60 transition-colors duration-300 focus:border-brun focus:outline-none'

/**
 * Champ de formulaire avec label en majuscules et message d'erreur accessible.
 * `as` peut valoir 'input', 'textarea' ou 'select'.
 */
export function Champ({ label, erreur, as: Balise = 'input', className = '', children, ...reste }) {
  const id = useId()
  const idErreur = `${id}-erreur`
  const hauteur = Balise === 'textarea' ? 'min-h-[120px] py-3' : 'h-12'

  return (
    <div className={className}>
      <label htmlFor={id} className="label mb-2 block text-cuivre">
        {label}
      </label>
      <Balise
        id={id}
        aria-invalid={Boolean(erreur)}
        aria-describedby={erreur ? idErreur : undefined}
        className={`${CLASSE_CHAMP} ${hauteur} ${erreur ? 'border-ambre' : 'border-sable'}`}
        {...reste}
      >
        {children}
      </Balise>
      {erreur && (
        <p id={idErreur} role="alert" className="mt-1.5 text-[13px] text-cuivre">
          {erreur}
        </p>
      )}
    </div>
  )
}

// Sélecteur de quantité − 1 +, borné entre 1 et le stock
export function SelecteurQuantite({ valeur, max = Infinity, surChangement, grand = false }) {
  const taille = grand ? 'h-12 w-12' : 'h-8 w-8'
  return (
    <div className={`flex w-fit items-center rounded border border-sable ${grand ? 'h-12' : 'h-8'}`}>
      <button
        type="button"
        onClick={() => surChangement(valeur - 1)}
        disabled={valeur <= 1}
        aria-label="Diminuer la quantité"
        className={`${taille} transition-colors hover:bg-sable disabled:opacity-30`}
      >
        −
      </button>
      <span className={`text-center tabular-nums ${grand ? 'w-10 text-[15px]' : 'w-8 text-[13px]'}`} aria-live="polite">
        {valeur}
      </span>
      <button
        type="button"
        onClick={() => surChangement(valeur + 1)}
        disabled={valeur >= max}
        aria-label="Augmenter la quantité"
        className={`${taille} transition-colors hover:bg-sable disabled:opacity-30`}
      >
        +
      </button>
    </div>
  )
}

const NOTES = [1, 2, 3, 4, 5]

// Note sur 5 affichée avec des losanges ambre
export function Note({ valeur, className = '' }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} role="img" aria-label={`Note : ${valeur} sur 5`}>
      {NOTES.map((rang) => (
        <span
          key={rang}
          aria-hidden="true"
          className={`h-2.5 w-2.5 rotate-45 ${rang <= Math.round(valeur) ? 'bg-ambre' : 'bg-sable'}`}
        />
      ))}
    </span>
  )
}
