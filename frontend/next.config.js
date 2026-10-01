/** @type {import('next').NextConfig} */

// Para GitHub Pages: defina NEXT_PUBLIC_BASE_PATH com o nome do seu repositório.
// Ex: se o repo se chama "Radar-de-Oportunidades", use:
//   NEXT_PUBLIC_BASE_PATH=/Radar-de-Oportunidades
// Em deploy local (npm run dev) pode deixar vazio.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  reactStrictMode: true,
  output: 'export',       // gera pasta /out com HTML/CSS/JS estáticos
  basePath,               // prefixo do repositório no GitHub Pages
  assetPrefix: basePath,  // garante que assets sejam carregados com o prefixo correto
  images: {
    unoptimized: true,    // export estático não suporta Image Optimization da Vercel
  },
}

module.exports = nextConfig
