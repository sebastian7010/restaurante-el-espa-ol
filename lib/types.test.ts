import { describe, expect, it } from 'vitest'
import { getCategoryColor, menuDataByLanguage, sampleMenuData } from './types'

describe('menu data model', () => {
  it('loads the Spanish starter catalog as drinks only', () => {
    expect(sampleMenuData).toHaveLength(1)
    expect(sampleMenuData[0].name).toBe('Bebidas')
    expect(sampleMenuData[0].items).toHaveLength(32)
    expect(sampleMenuData[0].items.every((item) => item.image.startsWith('/imagenes/'))).toBe(true)
  })

  it('keeps Spanish and English catalogs aligned', () => {
    expect(Object.keys(menuDataByLanguage)).toEqual(['es', 'en'])
    expect(menuDataByLanguage.es[0].name).toBe('Bebidas')
    expect(menuDataByLanguage.en[0].name).toBe('Drinks')
    expect(menuDataByLanguage.en[0].items).toHaveLength(menuDataByLanguage.es[0].items.length)
    expect(menuDataByLanguage.en[0].items[0].id).toBe(menuDataByLanguage.es[0].items[0].id)
  })

  it('assigns Spanish-inspired colors for category customization', () => {
    expect(getCategoryColor('Bebidas')).toBe('#9f1d25')
    expect(getCategoryColor('Drinks')).toBe('#9f1d25')
    expect(sampleMenuData.every((category) => Boolean(category.color))).toBe(true)
  })
})
