import { useState } from 'react'
import { estValide } from '../utils/validation'

/**
 * Gère les valeurs, les erreurs et la soumission d'un formulaire.
 * `valider(valeurs)` retourne un objet { champ: message } ; `surValide(valeurs)` n'est appelé que s'il est vide.
 */
export function useFormulaire(valeursInitiales, valider, surValide) {
  const [valeurs, setValeurs] = useState(valeursInitiales)
  const [erreurs, setErreurs] = useState({})

  const changer = (evenement) => {
    const { name, value } = evenement.target
    setValeurs((precedentes) => ({ ...precedentes, [name]: value }))
    setErreurs(({ [name]: _corrigee, ...restantes }) => restantes)
  }

  const soumettre = (evenement) => {
    evenement.preventDefault()
    const nouvellesErreurs = valider(valeurs)
    setErreurs(nouvellesErreurs)
    if (estValide(nouvellesErreurs)) surValide(valeurs)
  }

  // Attributs à étaler sur un <Champ> : {...champ('email')}
  const champ = (name) => ({ name, value: valeurs[name] ?? '', onChange: changer, erreur: erreurs[name] })

  return { valeurs, setValeurs, erreurs, setErreurs, champ, soumettre }
}
