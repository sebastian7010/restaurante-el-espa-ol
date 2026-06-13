import rawProducts from './definitivosProductos.json'
import enProducts from './menu-products/en.json'
import esProducts from './menu-products/es.json'
import type { LanguageCode } from './menu-i18n'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
}

interface RawProduct {
  id?: string
  name?: string
  description?: string
  price?: number
  image?: string
  category?: string
  nombre?: string
  precio?: number
  descripcion?: string
  categoria_busqueda?: string
  imagen_fuente?: string
}

export interface MenuCategory {
  id: string
  name: string
  color?: string
  items: MenuItem[]
}

export interface MenuStyle {
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  priceColor: string
  accentColor: string

  titleFontSize: number
  descriptionFontSize: number
  priceFontSize: number
  categoryFontSize: number
  fontFamily: string

  imageSize: 'small' | 'medium' | 'large' | 'full'
  imagePosition: 'left' | 'right' | 'top' | 'background'
  cardStyle: 'minimal' | 'bordered' | 'shadow' | 'glass'
  columns: 1 | 2 | 3
  spacing: 'compact' | 'normal' | 'spacious'
  textAlign: 'left' | 'center' | 'right'
  borderRadius: number

  showLogo: boolean
  logoUrl: string
  heroImageUrl: string
  headerText: string
  headerSubtitle: string
  headerStyle: 'centered' | 'left' | 'overlay'
}

export const defaultMenuStyle: MenuStyle = {
  backgroundColor: '#fff7ea',
  primaryColor: '#9f1d25',
  secondaryColor: '#6f3b1e',
  textColor: '#24150f',
  priceColor: '#9f1d25',
  accentColor: '#d6a536',

  titleFontSize: 18,
  descriptionFontSize: 14,
  priceFontSize: 16,
  categoryFontSize: 26,
  fontFamily: 'Georgia',

  imageSize: 'medium',
  imagePosition: 'top',
  cardStyle: 'shadow',
  columns: 2,
  spacing: 'normal',
  textAlign: 'left',
  borderRadius: 8,

  showLogo: true,
  logoUrl: '/logo.svg',
  heroImageUrl: '/imagenes/25-paella-de-marisco-00000000-240903144336-1200x1200.jpg',
  headerText: 'El Rinconcito Español',
  headerSubtitle: 'Un menú inspirado en los sabores de España.',
  headerStyle: 'overlay'
}

export const sampleMenuData: MenuCategory[] = buildMenuData(rawProducts as RawProduct[])
export const menuDataByLanguage: Record<LanguageCode, MenuCategory[]> = {
  es: buildMenuData(esProducts as RawProduct[]),
  en: buildMenuData(enProducts as RawProduct[])
}

function buildMenuData(products: RawProduct[]): MenuCategory[] {
  const categories = new Map<string, MenuCategory>()

  products.forEach((product, index) => {
    const categoryName = getCategoryName(product)
    const categoryId = slugify(categoryName)

    if (!categories.has(categoryId)) {
      categories.set(categoryId, { id: categoryId, name: categoryName, color: getCategoryColor(categoryName), items: [] })
    }

    const category = categories.get(categoryId)!
    const name = product.name?.trim() || product.nombre?.trim() || `Producto ${index + 1}`
    const price = typeof product.price === 'number' ? product.price : typeof product.precio === 'number' ? product.precio : 0

    category.items.push({
      id: product.id?.trim() || `product-${index + 1}`,
      name,
      description: product.description?.trim() || product.descripcion?.trim() || '',
      price,
      image: normalizeImagePath(product.image || product.imagen_fuente || '/placeholder.jpg'),
      category: categoryId
    })
  })

  return Array.from(categories.values())
}

export function getCategoryColor(categoryName: string) {
  const category = slugify(categoryName)
  if (category.includes('bebidas') || category.includes('drinks')) return '#9f1d25'
  return '#9f1d25'
}

function getCategoryName(product: RawProduct) {
  if (product.category) return toTitleCase(product.category)
  if (product.categoria_busqueda) return toTitleCase(product.categoria_busqueda)
  return 'Bebidas'
}

function toTitleCase(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && ['and', 'de', 'del', 'la', 'las', 'los', 'y'].includes(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Mark}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
}

function normalizeImagePath(value: string) {
  const image = value.trim()

  if (!image) return '/placeholder.jpg'
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('/')) return image
  return `/${image}`
}
