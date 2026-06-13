import { describe, expect, it } from 'vitest'
import { formatMenuPrice, languages, translateText, uiCopy } from './menu-i18n'

describe('menu i18n', () => {
  it('only exposes Spanish and English', () => {
    expect(languages.map((language) => language.code)).toEqual(['es', 'en'])
  })

  it('translates the starter drinks catalog to English', () => {
    expect(translateText('Bebidas', 'en')).toBe('Drinks')
    expect(translateText('Nombre', 'en')).toBe('Name')
    expect(translateText('Descripcion', 'en')).toBe('Description')
  })

  it('formats prices and pending-price labels for the active language', () => {
    expect(formatMenuPrice(8, 'es')).toContain('€')
    expect(formatMenuPrice(8, 'en')).toContain('€')
    expect(formatMenuPrice(0, 'es')).toBe(uiCopy.es.pendingPrice)
    expect(formatMenuPrice(0, 'en')).toBe(uiCopy.en.pendingPrice)
  })
})
