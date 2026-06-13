'use client'

import { useMenu } from '@/lib/menu-context'
import { MenuItem, MenuStyle } from '@/lib/types'

export function MenuPreview() {
  const { categories, style } = useMenu()
  const spacing = style.spacing === 'compact' ? 'gap-3' : style.spacing === 'spacious' ? 'gap-8' : 'gap-5'

  return (
    <div className="min-h-screen transition-colors" style={{ backgroundColor: style.backgroundColor, fontFamily: style.fontFamily }}>
      <MenuHeader style={style} />

      <div className="menu-preview-content mx-auto max-w-6xl px-4 py-8">
        {categories.map((category) => (
          <section key={category.id} className="mb-12">
            <h2
              className="mb-6 border-b-2 pb-2 font-bold"
              style={{
                borderColor: category.color || style.accentColor,
                color: category.color || style.primaryColor,
                fontSize: `${style.categoryFontSize}px`,
                textAlign: style.textAlign
              }}
            >
              {category.name}
            </h2>
            <div className={`menu-preview-grid grid ${spacing}`} style={{ gridTemplateColumns: `repeat(${style.columns}, minmax(0, 1fr))` }}>
              {category.items.map((item) => <MenuItemCard key={item.id} item={item} categoryColor={category.color} style={style} />)}
            </div>
          </section>
        ))}

        {categories.length === 0 && (
          <div className="py-20 text-center" style={{ color: style.textColor }}>
            <p className="text-xl opacity-70">No hay productos en el menú</p>
            <p className="mt-2 opacity-50">Agrega categorías y productos en el editor.</p>
          </div>
        )}
      </div>

      <footer className="px-4 py-6 text-center text-sm" style={{ color: style.secondaryColor }}>
        <span className="text-[11px] opacity-45">El Rinconcito Español</span>
      </footer>
    </div>
  )
}

function MenuHeader({ style }: { style: MenuStyle }) {
  const logo = style.showLogo && style.logoUrl
  const align = style.headerStyle === 'left' ? 'text-left' : 'text-center'

  if (style.headerStyle === 'overlay') {
    return (
      <header className="relative overflow-hidden px-4 py-14 sm:py-20">
        <img src={style.heroImageUrl || '/placeholder.jpg'} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${style.primaryColor}ee, ${style.primaryColor}88)` }} />
        <div className="relative z-10 mx-auto max-w-5xl text-center text-white">
          {logo && <img src={style.logoUrl} alt="Logo" className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-white/40 object-cover sm:h-24 sm:w-24" />}
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{style.headerText}</h1>
          {style.headerSubtitle && <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base md:text-lg">{style.headerSubtitle}</p>}
        </div>
      </header>
    )
  }

  return (
    <header className={`px-4 py-8 ${align}`} style={{ backgroundColor: style.primaryColor, color: '#fff' }}>
      <div className={`mx-auto max-w-5xl ${style.headerStyle === 'left' ? 'mx-0' : ''}`}>
        {logo && <img src={style.logoUrl} alt="Logo" className={`mb-4 h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20 ${style.headerStyle === 'centered' ? 'mx-auto' : ''}`} />}
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">{style.headerText}</h1>
        {style.headerSubtitle && <p className="mt-2 text-sm leading-6 opacity-85 md:text-base">{style.headerSubtitle}</p>}
      </div>
    </header>
  )
}

function MenuItemCard({ item, categoryColor, style }: { item: MenuItem; categoryColor?: string; style: MenuStyle }) {
  const imageSize = getImageSize(style.imageSize)
  const cardStyle = getCardStyle(style, categoryColor)
  const price = formatPrice(item.price)

  if (style.imagePosition === 'background') {
    return (
      <article className="menu-preview-card relative min-h-64 overflow-hidden" style={cardStyle}>
        <img src={item.image || '/placeholder.jpg'} alt={item.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${style.primaryColor}f2, ${style.primaryColor}33)` }} />
        <div className="relative flex min-h-64 flex-col justify-end p-4" style={{ textAlign: style.textAlign }}>
          <h3 className="font-bold text-white" style={{ fontSize: `${style.titleFontSize}px` }}>{item.name}</h3>
          {item.description && <p className="mt-1 line-clamp-3 text-white/85" style={{ fontSize: `${style.descriptionFontSize}px` }}>{item.description}</p>}
          <p className="mt-3 font-bold text-white" style={{ fontSize: `${style.priceFontSize}px` }}>{price}</p>
        </div>
      </article>
    )
  }

  if (style.imagePosition === 'top') {
    return (
      <article className="menu-preview-card overflow-hidden" style={cardStyle}>
        <div className="aspect-square w-full overflow-hidden bg-[#faf7f1]">
          <img src={item.image || '/placeholder.jpg'} alt={item.name} className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105" />
        </div>
        <MenuText item={item} price={price} style={style} />
      </article>
    )
  }

  const isLeft = style.imagePosition === 'left'

  return (
    <article className={`menu-preview-card flex overflow-hidden ${isLeft ? 'flex-row' : 'flex-row-reverse'}`} style={cardStyle}>
      <div className="menu-preview-side-image shrink-0 overflow-hidden bg-[#faf7f1]" style={imageSize}>
        <img src={item.image || '/placeholder.jpg'} alt={item.name} className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105" />
      </div>
      <MenuText item={item} price={price} style={style} compact />
    </article>
  )
}

function MenuText({ item, price, style, compact = false }: { item: MenuItem; price: string; style: MenuStyle; compact?: boolean }) {
  return (
    <div className={`flex flex-1 flex-col justify-center p-4 ${compact ? 'min-w-0' : ''}`} style={{ textAlign: style.textAlign }}>
      <div className={`flex gap-3 ${style.textAlign === 'right' ? 'flex-row-reverse' : ''} ${style.textAlign === 'center' ? 'flex-col items-center' : 'items-start justify-between'}`}>
        <h3 className="font-bold leading-tight" style={{ color: style.textColor, fontSize: `${style.titleFontSize}px` }}>{item.name}</h3>
        <span className="shrink-0 font-bold" style={{ color: style.priceColor, fontSize: `${style.priceFontSize}px` }}>{price}</span>
      </div>
      {item.description && <p className="mt-2 line-clamp-3 leading-5" style={{ color: style.secondaryColor, fontSize: `${style.descriptionFontSize}px` }}>{item.description}</p>}
    </div>
  )
}

function getCardStyle(style: MenuStyle, categoryColor?: string): React.CSSProperties {
  const base: React.CSSProperties = { borderRadius: `${style.borderRadius}px` }

  if (style.cardStyle === 'minimal') return { ...base, backgroundColor: 'transparent' }
  if (style.cardStyle === 'bordered') return { ...base, backgroundColor: tint(style.backgroundColor, 8), border: `1px solid ${categoryColor || style.accentColor}` }
  if (style.cardStyle === 'glass') return { ...base, backgroundColor: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(10px)', border: `1px solid ${categoryColor || 'rgba(255,255,255,0.4)'}` }
  return { ...base, backgroundColor: tint(style.backgroundColor, 8), border: `1px solid ${categoryColor ? `${categoryColor}44` : 'transparent'}`, boxShadow: '0 12px 30px rgba(55, 34, 20, 0.12)' }
}

function getImageSize(size: MenuStyle['imageSize']): React.CSSProperties {
  if (size === 'small') return { width: 80, height: 80 }
  if (size === 'large') return { width: 160, height: 160 }
  if (size === 'full') return { width: '100%', height: 192 }
  return { width: 112, height: 112 }
}

function tint(color: string, amount: number) {
  const hex = color.replace('#', '')
  if (hex.length !== 6) return color
  const next = [0, 2, 4].map((index) => Math.max(0, Math.min(255, parseInt(hex.slice(index, index + 2), 16) + amount)))
  return `#${next.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

function formatPrice(price: number) {
  if (price <= 0) return 'Sin precio'

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(price)
}
