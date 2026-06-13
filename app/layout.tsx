import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'El Rinconcito Español',
  description: 'Menú digital bilingüe inspirado en España, editable desde el área de administración.',
  generator: 'Codex',
  icons: {
    icon: [
      {
        url: '/logo.svg',
        type: 'image/svg+xml'
      }
    ],
    shortcut: '/logo.svg',
    apple: '/logo.svg'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
