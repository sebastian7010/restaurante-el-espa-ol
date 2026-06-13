'use client'

import { useState } from 'react'
import { useMenu } from '@/lib/menu-context'
import { ProductEditor } from '@/components/menu-editor/product-editor'
import { DesignEditor } from '@/components/menu-editor/design-editor'
import { ClientMenu } from '@/components/menu-editor/client-menu'
import { Button } from '@/components/ui/button'
import {
  Download,
  Eye,
  Menu,
  Monitor,
  Palette,
  Share2,
  ShoppingBag,
  Smartphone,
  Tablet,
  X
} from 'lucide-react'

export function AdminApp() {
  const { activeTab, setActiveTab, categories, style } = useMenu()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [status, setStatus] = useState('')

  const tabs = [
    { id: 'products' as const, label: 'Productos', icon: ShoppingBag },
    { id: 'design' as const, label: 'Diseño', icon: Palette },
    { id: 'preview' as const, label: 'Vista previa', icon: Eye }
  ]

  const deviceWidths = {
    mobile: { width: 390, height: 844, label: '390 x 844' },
    tablet: { width: 768, height: 1024, label: '768 x 1024' },
    desktop: { width: 1280, height: 800, label: '1280 x 800' }
  }
  const currentDevice = deviceWidths[previewDevice]

  const exportMenu = () => {
    const payload = JSON.stringify({ categories, style }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'menu-rinconcito-espanol.json'
    link.click()
    URL.revokeObjectURL(url)
    setStatus('Menú exportado como JSON')
  }

  const publishDemo = async () => {
    const demoUrl = `${window.location.origin}/cliente`
    await navigator.clipboard?.writeText(demoUrl)
    setStatus('Link del cliente copiado')
    setActiveTab('preview')
  }

  return (
    <div className="min-h-screen bg-[#f6efe6]">
      <header className="sticky top-0 z-50 border-b border-[#e6d7c5] bg-white/95 shadow-sm backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 transition-colors hover:bg-[#f4eadf] lg:hidden"
              aria-label="Abrir panel"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <img src="/logo.svg" alt="El Rinconcito Español" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0">
                <h1 className="truncate font-bold text-[#2f211b]">El Rinconcito Español</h1>
                <p className="truncate text-xs text-[#8a5b3e]">Área de administración</p>
              </div>
            </div>
          </div>

          <nav className="hidden items-center gap-1 rounded-lg bg-[#f4eadf] p-1 md:flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white text-[#7f271c] shadow-sm' : 'text-[#6c4a37] hover:bg-white/60'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {status && <span className="hidden text-xs text-[#6c4a37] xl:block">{status}</span>}
            <Button variant="outline" size="sm" className="hidden sm:flex" onClick={exportMenu}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button size="sm" className="bg-[#7f271c] hover:bg-[#682016]" onClick={publishDemo}>
              <Share2 className="mr-2 h-4 w-4" />
              Publicar
            </Button>
          </div>
        </div>

        <nav className="flex items-center gap-1 px-4 pb-3 md:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-[#7f271c] text-white' : 'bg-[#f4eadf] text-[#6c4a37]'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-full transform border-r border-[#e6d7c5] bg-white transition-transform sm:w-96 lg:relative lg:w-[430px] lg:transform-none ${
            sidebarOpen && activeTab !== 'preview' ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${activeTab === 'preview' ? 'lg:hidden' : ''}`}
          style={{ top: '64px', height: 'calc(100vh - 64px)' }}
        >
          <div className="h-full overflow-y-auto p-4">
            {activeTab === 'products' && <ProductEditor />}
            {activeTab === 'design' && <DesignEditor />}
          </div>
        </aside>

        <main className={`flex-1 ${activeTab !== 'preview' ? 'hidden lg:block' : ''}`} style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="sticky top-16 z-30 flex flex-wrap items-center justify-center gap-2 border-b border-gray-200 bg-gray-100 px-4 py-2">
            <span className="mr-2 text-sm text-gray-500">Vista previa:</span>
            <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm">
              {[
                { id: 'mobile' as const, icon: Smartphone, label: 'Móvil' },
                { id: 'tablet' as const, icon: Tablet, label: 'Tablet' },
                { id: 'desktop' as const, icon: Monitor, label: 'Escritorio' }
              ].map((device) => (
                <button
                  key={device.id}
                  onClick={() => setPreviewDevice(device.id)}
                  className={`rounded-md p-2 transition-colors ${
                    previewDevice === device.id ? 'bg-[#f4eadf] text-[#7f271c]' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  title={device.label}
                >
                  <device.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <span className="ml-2 rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-500 shadow-sm">{currentDevice.label}</span>
          </div>

          <div className="flex min-h-full justify-center overflow-auto bg-gray-100 p-4">
            <div
              className={`shrink-0 overflow-hidden bg-white shadow-2xl transition-all duration-300 ${
                previewDevice !== 'desktop' ? 'rounded-[28px]' : 'rounded-lg'
              }`}
              style={{
                width: currentDevice.width,
                height: currentDevice.height,
                border: previewDevice !== 'desktop' ? '10px solid #1f2937' : '1px solid #d1d5db'
              }}
            >
              <div className="h-full overflow-y-auto bg-white">
                <ClientMenu />
              </div>
            </div>
          </div>
        </main>
      </div>

      {sidebarOpen && activeTab !== 'preview' && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" style={{ top: '64px' }} onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
