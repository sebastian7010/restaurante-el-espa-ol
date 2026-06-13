'use client'

import { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from 'react'
import { MenuCategory, MenuStyle, MenuItem, defaultMenuStyle, getCategoryColor, sampleMenuData } from './types'

interface MenuContextType {
  categories: MenuCategory[]
  setCategories: Dispatch<SetStateAction<MenuCategory[]>>
  style: MenuStyle
  setStyle: (style: MenuStyle) => void
  updateStyle: (updates: Partial<MenuStyle>) => void
  addCategory: (name: string) => void
  removeCategory: (id: string) => void
  updateCategory: (id: string, name: string) => void
  organizeCategories: () => void
  addItem: (categoryId: string, item: Omit<MenuItem, 'id' | 'category'>) => void
  removeItem: (categoryId: string, itemId: string) => void
  updateItem: (categoryId: string, itemId: string, updates: Partial<MenuItem>) => void
  activeTab: 'products' | 'design' | 'preview'
  setActiveTab: (tab: 'products' | 'design' | 'preview') => void
  selectedCategory: string | null
  setSelectedCategory: (id: string | null) => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)
const PRODUCT_DATA_COUNT = sampleMenuData.reduce((total, category) => total + category.items.length, 0)
const lastCategory = sampleMenuData[sampleMenuData.length - 1]
const lastItem = lastCategory?.items[lastCategory.items.length - 1]
const firstItem = sampleMenuData[0]?.items[0]
const PRODUCT_DATA_SIGNATURE = `rinconcito-catalog-v1:${PRODUCT_DATA_COUNT}:${sampleMenuData.map((category) => category.name).join('|')}:${firstItem?.name ?? ''}:${firstItem?.price ?? 0}:${firstItem?.image ?? ''}:${lastItem?.name ?? ''}:${lastItem?.price ?? 0}:${lastItem?.image ?? ''}`

const CATEGORY_RULES = [
  { id: 'bebidas', name: 'Bebidas', words: ['agua', 'bebida', 'bebidas', 'cafe', 'café', 'cerveza', 'copa', 'jugo', 'limonada', 'refresco', 'sangria', 'sangría', 'vino'] }
]

export function MenuProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<MenuCategory[]>(sampleMenuData)
  const [style, setStyle] = useState<MenuStyle>(defaultMenuStyle)
  const [activeTab, setActiveTab] = useState<'products' | 'design' | 'preview'>('products')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem('rinconcito-menu-builder')
    if (!saved) {
      setLoaded(true)
      return
    }

    try {
      const parsed = JSON.parse(saved) as { categories?: MenuCategory[]; style?: MenuStyle; dataSignature?: string }
      if (parsed.categories) {
        setCategories(parsed.dataSignature === PRODUCT_DATA_SIGNATURE ? ensureCategoryColors(parsed.categories) : sampleMenuData)
      }
      if (parsed.style) {
        setStyle({ ...defaultMenuStyle, ...parsed.style })
      }
    } catch {
      window.localStorage.removeItem('rinconcito-menu-builder')
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    window.localStorage.setItem('rinconcito-menu-builder', JSON.stringify({ categories, style, dataSignature: PRODUCT_DATA_SIGNATURE }))
  }, [categories, loaded, style])

  const updateStyle = (updates: Partial<MenuStyle>) => {
    setStyle((prev) => ({ ...prev, ...updates }))
  }

  const addCategory = (name: string) => {
    const newCategory: MenuCategory = {
      id: Date.now().toString(),
      name,
      color: getCategoryColor(name),
      items: []
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }

  const updateCategory = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name, color: cat.color || getCategoryColor(name) } : cat))
    )
  }

  const organizeCategories = () => {
    setCategories((prev) => categorizeMenu(prev))
    setSelectedCategory(null)
  }

  const addItem = (categoryId: string, item: Omit<MenuItem, 'id' | 'category'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      category: categoryId
    }
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, items: [...cat.items, newItem] } : cat))
    )
  }

  const removeItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) } : cat))
    )
  }

  const updateItem = (categoryId: string, itemId: string, updates: Partial<MenuItem>) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
            }
          : cat
      )
    )
  }

  return (
    <MenuContext.Provider
      value={{
        categories,
        setCategories,
        style,
        setStyle,
        updateStyle,
        addCategory,
        removeCategory,
        updateCategory,
        organizeCategories,
        addItem,
        removeItem,
        updateItem,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

function categorizeMenu(categories: MenuCategory[]) {
  const buckets = new Map<string, MenuCategory>()

  for (const rule of CATEGORY_RULES) {
    buckets.set(rule.id, { id: rule.id, name: rule.name, color: getCategoryColor(rule.name), items: [] })
  }

  for (const item of categories.flatMap((category) => category.items)) {
    const category = getItemCategory(item)
    buckets.get(category.id)!.items.push({ ...item, category: category.id })
  }

  return Array.from(buckets.values()).filter((category) => category.items.length > 0)
}

function ensureCategoryColors(categories: MenuCategory[]) {
  return categories.map((category) => ({
    ...category,
    color: category.color || getCategoryColor(category.name)
  }))
}

function getItemCategory(item: MenuItem) {
  const text = normalizeText(`${item.name} ${item.description}`)
  return CATEGORY_RULES.find((rule) => rule.words.some((word) => text.includes(normalizeText(word)))) ?? { id: 'bebidas', name: 'Bebidas' }
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider')
  }
  return context
}
