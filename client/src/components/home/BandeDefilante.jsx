import { categories } from '../../data/categories'

// Bande de texte défilante (marquee) avec les catégories.
// La piste est dupliquée pour boucler sans couture ; la copie est masquée aux lecteurs d'écran.
function Piste({ masquee = false }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={masquee}>
      {categories.map((categorie) => (
        <li key={categorie._id} className="flex items-center">
          <span className="px-8 text-[clamp(36px,6vw,88px)] leading-none tracking-[-0.04em] sm:px-12">
            {categorie.name}
          </span>
          <span className="text-[clamp(18px,2vw,28px)] text-ambre" aria-hidden="true">
            ✦
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function BandeDefilante() {
  return (
    <section aria-label="Nos catégories" className="overflow-hidden bg-brun py-8 text-creme sm:py-10">
      <div className="flex w-max animate-defile hover:[animation-play-state:paused]">
        <Piste />
        <Piste masquee />
      </div>
    </section>
  )
}
