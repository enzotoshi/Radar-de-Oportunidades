import type { Metadata } from 'next'
import '@fontsource-variable/ibm-plex-sans'
import '@/styles/tokens.css'
import '@/styles/base.css'
import 'leaflet/dist/leaflet.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Radar de Oportunidades Inteligente',
  description:
    'Análise territorial de oportunidades de negócio no Brasil com dados públicos identificados.',
  keywords: ['dados públicos', 'negócios', 'análise territorial', 'oportunidades', 'Brasil'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
