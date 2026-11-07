import type { Metadata, Viewport } from 'next'
import { Alegreya, Nunito } from 'next/font/google'
import './globals.css'

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin', 'latin-ext'],
})

const alegreya = Alegreya({
  variable: '--font-alegreya',
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
})

export const metadata: Metadata = {
  title: 'Czarcia Łapa: Wyprawa przez Lubelskie',
  description:
    'Gra przygodowa 3D po województwie lubelskim. Odzyskaj siedem skarbów regionu i stań przed Trybunałem.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#b9a2dd',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pl" className={`${nunito.variable} ${alegreya.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
