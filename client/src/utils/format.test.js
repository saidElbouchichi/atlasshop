import { describe, expect, test } from 'vitest'
import { deuxChiffres, formaterPrix } from './format'
import { srcSetPhoto, urlPhoto } from './images'
import { lienWhatsApp, messageConseilProduit } from './whatsapp'

describe('formaterPrix', () => {
  test('sépare les milliers par une espace insécable et ajoute MAD', () => {
    expect(formaterPrix(3400)).toBe('3 400 MAD')
    expect(formaterPrix(1250000)).toBe('1 250 000 MAD')
  })

  test('laisse les petits montants tels quels', () => {
    expect(formaterPrix(95)).toBe('95 MAD')
  })

  test('retourne 0 MAD pour une valeur invalide', () => {
    expect(formaterPrix(undefined)).toBe('0 MAD')
    expect(formaterPrix(NaN)).toBe('0 MAD')
  })
})

describe('deuxChiffres', () => {
  test('complète avec un zéro', () => {
    expect(deuxChiffres(1)).toBe('01')
    expect(deuxChiffres(12)).toBe('12')
  })
})

describe('images', () => {
  test('construit une URL WebP à la largeur demandée', () => {
    const url = urlPhoto('abc', 480)

    expect(url).toContain('photo-abc')
    expect(url).toContain('fm=webp')
    expect(url).toContain('w=480')
  })

  test('construit un srcset avec un descripteur par largeur', () => {
    expect(srcSetPhoto('abc', [400, 800]).split(', ')).toHaveLength(2)
    expect(srcSetPhoto('abc', [400, 800])).toMatch(/400w, .* 800w$/)
  })
})

describe('whatsapp', () => {
  test('encode le message dans le lien', () => {
    const lien = lienWhatsApp(messageConseilProduit('Tapis Beni Ouarain'))

    expect(lien).toMatch(/^https:\/\/wa\.me\/\d+\?text=/)
    expect(lien).toContain(encodeURIComponent('Tapis Beni Ouarain'))
  })
})
