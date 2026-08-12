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
      <body>{children}</body>
    </html>
  )
}
