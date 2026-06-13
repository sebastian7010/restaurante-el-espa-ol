import { describe, expect, it } from 'vitest'
import enProducts from './menu-products/en.json'
import esProducts from './menu-products/es.json'
import { menuDataByLanguage } from './types'

type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

const catalogs = {
  es: esProducts as Product[],
  en: enProducts as Product[]
}

describe('localized product catalogs', () => {
  it('keeps the same product IDs, prices and images in Spanish and English', () => {
    const source = catalogs.es

    for (const [language, products] of Object.entries(catalogs)) {
      expect(products, language).toHaveLength(32)

      products.forEach((product, index) => {
        expect(product.id, `${language} product ${index + 1} id`).toBe(source[index].id)
        expect(product.price, `${language} product ${index + 1} price`).toBe(source[index].price)
        expect(product.image, `${language} product ${index + 1} image`).toBe(source[index].image)
        expect(product.image, `${language} product ${index + 1} image format`).toMatch(/^\/imagenes\/.+\.(avif|jpe?g|png|webp)$/)
      })
    }
  })

  it('builds one visible category per language', () => {
    expect(menuDataByLanguage.es).toHaveLength(1)
    expect(menuDataByLanguage.en).toHaveLength(1)
    expect(menuDataByLanguage.es[0].name).toBe('Bebidas')
    expect(menuDataByLanguage.en[0].name).toBe('Drinks')
  })

  it('leaves editable placeholder names and descriptions for admin work', () => {
    expect(catalogs.es[0]).toMatchObject({ name: 'Nombre', description: 'Descripcion', category: 'BEBIDAS' })
    expect(catalogs.en[0]).toMatchObject({ name: 'Name', description: 'Description', category: 'DRINKS' })
    expect(catalogs.es.every((product) => product.name === 'Nombre' && product.description === 'Descripcion')).toBe(true)
    expect(catalogs.en.every((product) => product.name === 'Name' && product.description === 'Description')).toBe(true)
  })
})
