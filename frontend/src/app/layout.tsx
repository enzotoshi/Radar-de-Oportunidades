import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Radar de Oportunidades Inteligente',
  description:
    'Plataforma de análise de oportunidades de negócio em Smart Cities — São Paulo e região',
  keywords: ['smart cities', 'negócios', 'análise', 'oportunidades', 'São Paulo'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Leaflet CSS - OpenStreetMap (GRÁTIS, sem necessidade de cartão) */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
