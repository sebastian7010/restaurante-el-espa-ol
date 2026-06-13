'use client'

import { useMenu } from '@/lib/menu-context'
import { defaultMenuStyle } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Image, Layout, Palette, RotateCcw, Sparkles, Type } from 'lucide-react'

const fontFamilies = ['Georgia', 'Arial', 'Times New Roman', 'Montserrat', 'Lora', 'Verdana']

const colorPresets = [
  {
    name: 'España clásico',
    colors: {
      backgroundColor: '#fff7ea',
      primaryColor: '#9f1d25',
      secondaryColor: '#6f3b1e',
      textColor: '#24150f',
      priceColor: '#9f1d25',
      accentColor: '#d6a536'
    }
  },
  {
    name: 'Taberna',
    colors: {
      backgroundColor: '#fbfaf7',
      primaryColor: '#1f1a17',
      secondaryColor: '#6f6258',
      textColor: '#2b2521',
      priceColor: '#9f1d25',
      accentColor: '#d6a536'
    }
  },
  {
    name: 'Oliva',
    colors: {
      backgroundColor: '#f5f8f0',
      primaryColor: '#315c45',
      secondaryColor: '#6b7f58',
      textColor: '#1f3027',
      priceColor: '#315c45',
      accentColor: '#c7d3a2'
    }
  },
  {
    name: 'Granada',
    colors: {
      backgroundColor: '#fff4f2',
      primaryColor: '#8f3f4c',
      secondaryColor: '#9c6a63',
      textColor: '#33201f',
      priceColor: '#8f3f4c',
      accentColor: '#f2c8bf'
    }
  }
]

export function DesignEditor() {
  const { categories, setCategories, style, updateStyle, setStyle } = useMenu()

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>, key: 'logoUrl' | 'heroImageUrl') => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => updateStyle({ [key]: reader.result as string })
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-[#b5884d]" />
            Temas rápidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateStyle(preset.colors)}
                className="rounded-lg border p-3 text-left transition-colors hover:border-[#d8b56d]"
                style={{ backgroundColor: preset.colors.backgroundColor }}
              >
                <div className="mb-2 flex gap-1">
                  {Object.values(preset.colors).slice(1, 5).map((color) => (
                    <span key={color} className="h-4 w-4 rounded-full border border-white" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: preset.colors.textColor }}>{preset.name}</span>
              </button>
            ))}
          </div>
          <Button variant="outline" className="mt-3 w-full" onClick={() => setStyle(defaultMenuStyle)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar predeterminado
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-[#b5884d]" />
            Colores
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <ColorPicker label="Fondo" value={style.backgroundColor} onChange={(value) => updateStyle({ backgroundColor: value })} />
          <ColorPicker label="Principal" value={style.primaryColor} onChange={(value) => updateStyle({ primaryColor: value })} />
          <ColorPicker label="Secundario" value={style.secondaryColor} onChange={(value) => updateStyle({ secondaryColor: value })} />
          <ColorPicker label="Texto" value={style.textColor} onChange={(value) => updateStyle({ textColor: value })} />
          <ColorPicker label="Precio" value={style.priceColor} onChange={(value) => updateStyle({ priceColor: value })} />
          <ColorPicker label="Acento" value={style.accentColor} onChange={(value) => updateStyle({ accentColor: value })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-[#b5884d]" />
            Colores por categoría
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <ColorPicker
              key={category.id}
              label={category.name}
              value={category.color || style.primaryColor}
              onChange={(value) => {
                setCategories((current) =>
                  current.map((entry) =>
                    entry.id === category.id ? { ...entry, color: value } : entry
                  )
                )
              }}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="h-5 w-5 text-[#b5884d]" />
            Tipografía
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Fuente</Label>
            <select
              value={style.fontFamily}
              onChange={(event) => updateStyle({ fontFamily: event.target.value })}
              className="mt-1 w-full rounded-md border bg-white p-2"
              style={{ fontFamily: style.fontFamily }}
            >
              {fontFamilies.map((font) => <option key={font} value={font}>{font}</option>)}
            </select>
          </div>
          <SliderControl label="Títulos de productos" value={style.titleFontSize} min={14} max={30} onChange={(value) => updateStyle({ titleFontSize: value })} />
          <SliderControl label="Descripciones" value={style.descriptionFontSize} min={11} max={20} onChange={(value) => updateStyle({ descriptionFontSize: value })} />
          <SliderControl label="Precios" value={style.priceFontSize} min={12} max={26} onChange={(value) => updateStyle({ priceFontSize: value })} />
          <SliderControl label="Categorías" value={style.categoryFontSize} min={18} max={38} onChange={(value) => updateStyle({ categoryFontSize: value })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layout className="h-5 w-5 text-[#b5884d]" />
            Diseño
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChoiceGroup label="Columnas" value={String(style.columns)} options={['1', '2', '3']} onChange={(value) => updateStyle({ columns: Number(value) as 1 | 2 | 3 })} />
          <ChoiceGroup label="Tarjetas" value={style.cardStyle} options={['minimal', 'bordered', 'shadow', 'glass']} onChange={(value) => updateStyle({ cardStyle: value as typeof style.cardStyle })} />
          <ChoiceGroup label="Espaciado" value={style.spacing} options={['compact', 'normal', 'spacious']} onChange={(value) => updateStyle({ spacing: value as typeof style.spacing })} />
          <ChoiceGroup label="Alineación del texto" value={style.textAlign} options={['left', 'center', 'right']} onChange={(value) => updateStyle({ textAlign: value as typeof style.textAlign })} />
          <SliderControl label="Radio de bordes" value={style.borderRadius} min={0} max={24} onChange={(value) => updateStyle({ borderRadius: value })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Image className="h-5 w-5 text-[#b5884d]" />
            Imágenes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ChoiceGroup label="Tamaño de imagen" value={style.imageSize} options={['small', 'medium', 'large', 'full']} onChange={(value) => updateStyle({ imageSize: value as typeof style.imageSize })} />
          <ChoiceGroup label="Posición de imagen" value={style.imagePosition} options={['left', 'right', 'top', 'background']} onChange={(value) => updateStyle({ imagePosition: value as typeof style.imagePosition })} />
          <div className="grid grid-cols-2 gap-3">
            <ImageUpload label="Logo" image={style.logoUrl} onChange={(event) => uploadImage(event, 'logoUrl')} />
            <ImageUpload label="Portada" image={style.heroImageUrl} onChange={(event) => uploadImage(event, 'heroImageUrl')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-[#b5884d]" />
            Encabezado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Título del menú</Label>
            <Input value={style.headerText} onChange={(event) => updateStyle({ headerText: event.target.value })} className="mt-1" />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Input value={style.headerSubtitle} onChange={(event) => updateStyle({ headerSubtitle: event.target.value })} className="mt-1" />
          </div>
          <ChoiceGroup label="Estilo de encabezado" value={style.headerStyle} options={['centered', 'left', 'overlay']} onChange={(value) => updateStyle({ headerStyle: value as typeof style.headerStyle })} />
        </CardContent>
      </Card>
    </div>
  )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-10 cursor-pointer rounded-md border" />
        <Input value={value} onChange={(event) => onChange(event.target.value)} maxLength={7} className="font-mono text-xs uppercase" />
      </div>
    </div>
  )
}

function SliderControl({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-medium text-[#7f271c]">{value}px</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={(next) => onChange(next[0])} />
    </div>
  )
}

function ChoiceGroup({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <Label className="mb-2 block text-sm">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={value === option ? 'default' : 'outline'}
            className={value === option ? 'bg-[#7f271c] hover:bg-[#682016]' : ''}
            onClick={() => onChange(option)}
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}

function ImageUpload({ label, image, onChange }: { label: string; image: string; onChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="block cursor-pointer">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <span className="flex h-24 items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#d8b56d] bg-[#fff8ef]">
        {image ? <img src={image} alt={label} className="h-full w-full object-cover" /> : <Image className="h-6 w-6 text-[#b5884d]" />}
      </span>
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  )
}
