import { sourcesPhoto } from '../../utils/images'

/**
 * Image responsive : WebP, srcset et lazy-load par défaut.
 * @param {{ image: { id?: string, url?: string, alt: string }, sizes?: string, prioritaire?: boolean, className?: string }} props
 */
export default function Photo({ image, sizes = '100vw', prioritaire = false, className = '', ...reste }) {
  return (
    <img
      {...sourcesPhoto(image)}
      sizes={sizes}
      alt={image.alt}
      loading={prioritaire ? 'eager' : 'lazy'}
      fetchpriority={prioritaire ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      className={className}
      {...reste}
    />
  )
}
