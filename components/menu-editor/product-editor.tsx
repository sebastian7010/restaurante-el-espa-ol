'use client'

import { useState } from 'react'
import { useMenu } from '@/lib/menu-context'
import { MenuItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Check, Edit2, FolderTree, ImagePlus, Plus, Trash2, X } from 'lucide-react'

const emptyItem = { name: '', description: '', price: 0, image: '' }

export function ProductEditor() {
  const {
    categories,
    setCategories,
    addCategory,
    removeCategory,
    updateCategory,
    organizeCategories,
    addItem,
    removeItem,
    updateItem,
    selectedCategory,
    setSelectedCategory
  } = useMenu()

  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [showItemForm, setShowItemForm] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState(emptyItem)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkUploadCount, setBulkUploadCount] = useState(0)

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    addCategory(newCategoryName.trim())
    setNewCategoryName('')
  }

  const handleAddItem = (categoryId: string) => {
    if (!newItem.name.trim()) return
    addItem(categoryId, {
      name: newItem.name.trim(),
      description: newItem.description.trim(),
      price: newItem.price,
      image: newItem.image || '/placeholder.jpg'
    })
    setNewItem(emptyItem)
    setShowItemForm(null)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => callback(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleBulkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'))
    event.target.value = ''
    if (files.length === 0) return

    setBulkUploading(true)

    try {
      const uploadedItems = await Promise.all(
        files.map(async (file, index) => ({
          id: `bulk-${Date.now()}-${index}`,
          name: cleanFileName(file.name),
          description: 'Producto pendiente por editar.',
          price: 0,
          image: await readFileAsDataUrl(file),
          category: 'pendientes'
        }))
      )

      setCategories((current) => {
        const pendingCategory = current.find((category) => category.id === 'pendientes')
        if (pendingCategory) {
          return current.map((category) =>
            category.id === 'pendientes'
              ? { ...category, items: [...uploadedItems, ...category.items] }
              : category
          )
        }

        return [
          {
            id: 'pendientes',
            name: 'Pendientes de categorizar',
            items: uploadedItems
          },
          ...current
        ]
      })
      setSelectedCategory('pendientes')
      setBulkUploadCount(files.length)
    } finally {
      setBulkUploading(false)
    }
  }

  const moveItemToCategory = (fromCategoryId: string, itemId: string, toCategoryId: string, updates: Partial<MenuItem>) => {
    if (fromCategoryId === toCategoryId) {
      updateItem(fromCategoryId, itemId, updates)
      return
    }

    setCategories((current) => {
      const sourceCategory = current.find((category) => category.id === fromCategoryId)
      const item = sourceCategory?.items.find((entry) => entry.id === itemId)
      if (!item) return current

      const movedItem = { ...item, ...updates, category: toCategoryId }

      return current.map((category) => {
        if (category.id === fromCategoryId) {
          return { ...category, items: category.items.filter((entry) => entry.id !== itemId) }
        }

        if (category.id === toCategoryId) {
          return { ...category, items: [movedItem, ...category.items] }
        }

        return category
      })
    })
  }

  return (
    <div className="space-y-5">
      <Card className="border-2 border-dashed border-[#7f271c]/30 bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#2f211b]">Subir imágenes al catálogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[#6c4a37]">
            Selecciona cualquier cantidad de imágenes. Se crearán como productos pendientes para que después les pongas categoría, nombre y precio.
          </p>
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#d8b56d] bg-[#fff8ef] px-4 py-4 text-sm font-semibold text-[#7f271c] hover:bg-[#f8eee2]">
            <ImagePlus className="mr-2 h-5 w-5" />
            {bulkUploading ? 'Subiendo imágenes...' : 'Seleccionar imágenes'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleBulkImageUpload} />
          </label>
          {bulkUploadCount > 0 && (
            <p className="text-xs font-medium text-[#8a5b3e]">
              {bulkUploadCount} imagen{bulkUploadCount === 1 ? '' : 'es'} agregada{bulkUploadCount === 1 ? '' : 's'} a Pendientes de categorizar.
            </p>
          )}
        </CardContent>
      </Card>

      <Button onClick={organizeCategories} className="w-full bg-[#7f271c] hover:bg-[#682016]">
        <FolderTree className="mr-2 h-4 w-4" />
        Organizar por categorías
      </Button>

      <Card className="border-2 border-dashed border-[#d8b56d] bg-[#fff8ef]">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nueva categoría"
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} className="bg-[#7f271c] hover:bg-[#682016]">
              <Plus className="mr-1 h-4 w-4" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {categories.map((category) => (
        <Card key={category.id} className={selectedCategory === category.id ? 'ring-2 ring-[#d8b56d]' : ''}>
          <CardHeader className="bg-[#f4eadf] pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {editingCategory === category.id ? (
                  <div className="flex items-center gap-2">
                    <Input value={editCategoryName} onChange={(event) => setEditCategoryName(event.target.value)} autoFocus />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (editCategoryName.trim()) updateCategory(category.id, editCategoryName.trim())
                        setEditingCategory(null)
                      }}
                    >
                      <Check className="h-4 w-4 text-green-700" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingCategory(null)}>
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <button
                    className="max-w-full text-left"
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  >
                    <CardTitle className="truncate text-xl text-[#2f211b]">{category.name}</CardTitle>
                  </button>
                )}
                <p className="mt-1 text-sm text-[#8a5b3e]">
                  {category.items.length} producto{category.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditingCategory(category.id)
                    setEditCategoryName(category.name)
                  }}
                >
                  <Edit2 className="h-4 w-4 text-[#7f271c]" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => removeCategory(category.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-4">
            {category.items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-lg border border-[#eadfce] bg-white p-3">
                <ImagePicker
                  image={item.image}
                  label={item.name}
                  onChange={(url) => updateItem(category.id, item.id, { image: url })}
                />
                <div className="min-w-0 flex-1">
                  {editingItem === item.id ? (
                    <EditItemForm
                      item={item}
                      categoryId={category.id}
                      categories={categories}
                      onSave={(updates) => {
                        const { category: nextCategoryId, ...itemUpdates } = updates
                        moveItemToCategory(category.id, item.id, nextCategoryId || category.id, itemUpdates)
                        setEditingItem(null)
                      }}
                      onCancel={() => setEditingItem(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate font-semibold text-[#2f211b]">{item.name}</h4>
                        <span className="shrink-0 font-bold text-[#7f271c]">{formatPrice(item.price)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-[#6c4a37]">{item.description}</p>
                    </>
                  )}
                </div>
                {editingItem !== item.id && (
                  <div className="flex shrink-0 flex-col gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingItem(item.id)}>
                      <Edit2 className="h-4 w-4 text-[#7f271c]" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeItem(category.id, item.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {showItemForm === category.id ? (
              <Card className="border-[#d8b56d] bg-[#fff8ef]">
                <CardContent className="space-y-3 pt-4">
                  <div className="flex gap-3">
                    <ImagePicker
                      image={newItem.image}
                      label="Nuevo producto"
                      large
                      onChange={(url) => setNewItem((prev) => ({ ...prev, image: url }))}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Nombre del producto"
                        value={newItem.name}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, name: event.target.value }))}
                      />
                      <Textarea
                        placeholder="Descripción"
                        value={newItem.description}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, description: event.target.value }))}
                        className="min-h-20"
                      />
                      <Input
                        type="number"
                        placeholder="Precio en EUR"
                        value={newItem.price || ''}
                        onChange={(event) => setNewItem((prev) => ({ ...prev, price: Number(event.target.value) }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setShowItemForm(null); setNewItem(emptyItem) }}>
                      Cancelar
                    </Button>
                    <Button className="bg-[#7f271c] hover:bg-[#682016]" onClick={() => handleAddItem(category.id)}>
                      Agregar producto
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="w-full border-dashed border-[#d8b56d] text-[#7f271c] hover:bg-[#fff8ef]"
                onClick={() => setShowItemForm(category.id)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar producto
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ImagePicker({
  image,
  label,
  large = false,
  onChange
}: {
  image: string
  label: string
  large?: boolean
  onChange: (url: string) => void
}) {
  return (
    <label className={`relative shrink-0 cursor-pointer overflow-hidden rounded-lg bg-[#f4eadf] ${large ? 'h-28 w-28' : 'h-20 w-20'}`}>
      {image ? (
        <img src={image} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center">
          <ImagePlus className="h-7 w-7 text-[#b5884d]" />
        </span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/30">
        <ImagePlus className="h-6 w-6 text-white opacity-0 transition-opacity hover:opacity-100" />
      </span>
      <input type="file" accept="image/*" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => onChange(reader.result as string)
        reader.readAsDataURL(file)
      }} />
    </label>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function cleanFileName(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Producto sin nombre'
}

function EditItemForm({
  item,
  categoryId,
  categories,
  onSave,
  onCancel
}: {
  item: MenuItem
  categoryId: string
  categories: Array<{ id: string; name: string }>
  onSave: (updates: Partial<MenuItem>) => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState({
    name: item.name,
    description: item.description,
    price: item.price,
    category: categoryId
  })

  return (
    <div className="space-y-2">
      <Input value={editData.name} onChange={(event) => setEditData((prev) => ({ ...prev, name: event.target.value }))} />
      <Textarea value={editData.description} onChange={(event) => setEditData((prev) => ({ ...prev, description: event.target.value }))} className="min-h-16" />
      <select
        value={editData.category}
        onChange={(event) => setEditData((prev) => ({ ...prev, category: event.target.value }))}
        className="h-9 w-full rounded-md border border-[#eadfce] bg-white px-3 text-sm"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editData.price}
          onChange={(event) => setEditData((prev) => ({ ...prev, price: Number(event.target.value) }))}
          className="w-32"
        />
        <div className="ml-auto flex gap-1">
          <Button size="icon" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
          <Button size="icon" className="bg-[#7f271c] hover:bg-[#682016]" onClick={() => onSave(editData)}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatPrice(price: number) {
  if (price <= 0) return 'Sin precio'

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(price)
}
