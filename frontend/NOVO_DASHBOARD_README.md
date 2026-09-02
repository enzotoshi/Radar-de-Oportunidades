# Novo Dashboard - Radar de Oportunidades

## ✨ O que foi implementado

Foi criada uma interface profissional completamente nova, seguindo o design especificado da imagem de referência. O resultado é um dashboard estilo SaaS moderno e funcional.

### 🎨 Características Principais

#### 1. **Visual Profissional**
- Paleta de cores moderna (Azul #2563EB, Verde #16A34A, fundo #F8FAFC)
- Design clean e minimalista
- Cards com sombras suaves
- Tipografia Inter para melhor legibilidade
- Interface sem header/barra superior

#### 2. **Sidebar Fixa (280px)**
- **Navegação:** 6 itens com ícones (Visão Geral, Mapa, Análises, Relatórios, Simulações, Favoritos)
- **Filtros funcionais:**
  - Localização (input com ícone)
  - Tipo de negócio (select com 8 opções)
  - Orçamento (slider de R$ 10 mil a R$ 2 mi+)
  - Faixa de renda (select)
- **Botões de ação:**
  - Analisar (verde, destaque)
  - Simular investimento (branco com borda verde)
- **Informação:** "Dados atualizados recentemente"

#### 3. **Cards de Indicadores (4 cards superiores)**
- População (1,2 mi | +1,8%)
- Renda média (R$ 4.842 | +6,2%)
- Concorrência (Média | Índice 5,3/10)
- Demanda potencial (Alta | Índice 8,7/10)
- Cada card com ícone colorido e indicador de mudança

#### 4. **Mapa de Oportunidades (Google Maps integrado)**
- **Controles superiores esquerdos:** Botões Mapa/Satélite
- **Controles direitos:** Zoom +/-, Centralizar, Configurações
- **Marcadores:** Coloridos por score (verde 80+, amarelo 60-79, laranja 40-59, vermelho <40)
- **Info Window:** Ao clicar mostra nome, categoria, concorrência e potencial
- **Legenda:** Gradiente de cores no canto inferior esquerdo (Baixo → Alto)
- Pronto para receber dados de heatmap

#### 5. **Ranking de Oportunidades**
- Lista com 4 negócios ranqueados
- Cada item mostra: posição, ícone, nome, score e descrição
- Scores coloridos por faixa
- Botão "Ver todas as oportunidades →" no final

#### 6. **Justificativa da Análise**
- Título e score com badge colorido
- Texto explicativo detalhado
- Tags de características (Alta demanda, Baixa concorrência, Alto fluxo, Renda favorável)

#### 7. **Perfil Demográfico**
- Grid com 4 indicadores:
  - População total (1,2 mi)
  - Idade predominante (25-34 anos)
  - Densidade populacional (8.617 hab/km²)
  - Poder de compra (Alto)
- Cada indicador com ícone colorido

#### 8. **Gráfico de Desempenho (Recharts)**
- Gráfico de linhas mostrando 5 categorias
- Período de 12 meses (últimos Jun a Mai)
- Selector de período (6/12/24 meses)
- Legenda interativa com variação mensal
- Tooltip estilizado

#### 9. **Responsividade Básica**
- Sidebar vira menu hamburguer em mobile
- Cards quebram em 2 ou 1 coluna
- Mapa ocupa largura total
- Grid responsivo

---

## 🚀 Como Executar

### 1. Instalar dependências (se ainda não instalou)

\`\`\`bash
cd frontend
npm install
\`\`\`

### 2. Configurar a API Key do Google Maps

Crie um arquivo `.env.local` na pasta `frontend`:

\`\`\`env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
\`\`\`

> **Importante:** Sem a chave do Google Maps, o mapa não será carregado. Se não tiver uma chave, você pode obter gratuitamente em: https://console.cloud.google.com/

### 3. Executar em desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:3000

### 4. Build para produção

\`\`\`bash
npm run build
npm start
\`\`\`

---

## 📁 Estrutura dos Arquivos Criados

\`\`\`
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # Estilos globais atualizados
│   │   └── page.tsx              # Página principal atualizada
│   │
│   ├── components/
│   │   └── dashboard/
│   │       ├── Dashboard.tsx                    # Container principal
│   │       ├── Sidebar.tsx                      # Navegação e filtros
│   │       ├── StatsCard.tsx                    # Card individual
│   │       ├── StatsCards.tsx                   # Grid de cards
│   │       ├── OpportunityMap.tsx               # Mapa Google Maps
│   │       ├── OpportunityRanking.tsx           # Lista de rankings
│   │       ├── AnalysisJustification.tsx        # Justificativa IA
│   │       ├── DemographicProfile.tsx           # Perfil demográfico
│   │       ├── CategoryPerformanceChart.tsx     # Gráfico Recharts
│   │       └── index.ts                         # Exports
│   │
│   ├── data/
│   │   └── mockDashboard.ts      # Dados mockados (fácil de substituir)
│   │
│   └── types/
│       └── dashboard.ts           # Tipos TypeScript
│
└── tailwind.config.js            # Configuração atualizada

\`\`\`

---

## 🔄 Como Conectar com o Backend

Atualmente todos os dados estão em **`src/data/mockDashboard.ts`**.

Para conectar com o backend real:

### 1. Criar um service de API

\`\`\`typescript
// src/services/dashboardService.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const dashboardService = {
  async getStats(filters: FilterState) {
    const response = await axios.post(\`\${API_BASE_URL}/api/stats\`, filters);
    return response.data;
  },

  async getOpportunities(filters: FilterState) {
    const response = await axios.post(\`\${API_BASE_URL}/api/opportunities\`, filters);
    return response.data;
  },

  async getDemographics(location: string) {
    const response = await axios.get(\`\${API_BASE_URL}/api/demographics/\${location}\`);
    return response.data;
  }
};
\`\`\`

### 2. Atualizar o Dashboard.tsx

Substitua os imports de mock pelos dados da API:

\`\`\`typescript
import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboardService';

// No componente Dashboard:
useEffect(() => {
  async function fetchData() {
    const stats = await dashboardService.getStats(filters);
    setStatsData(stats);
    // ... outros fetches
  }
  fetchData();
}, [filters]);
\`\`\`

---

## 🎯 Funcionalidades Implementadas

✅ Layout sem header/barra superior  
✅ Sidebar fixa com navegação e filtros  
✅ Slider de orçamento funcional  
✅ Selects de filtros funcionais  
✅ Botão "Limpar" restaura filtros  
✅ Botões Analisar e Simular com eventos  
✅ Cards de indicadores dinâmicos  
✅ Mapa Google Maps integrado  
✅ Marcadores coloridos por score  
✅ Info Window ao clicar no marcador  
✅ Controles de zoom e tipo de mapa  
✅ Ranking com scores coloridos  
✅ Justificativa com tags  
✅ Perfil demográfico  
✅ Gráfico de linhas interativo  
✅ Responsividade básica  
✅ Menu mobile com overlay  

---

## 🎨 Paleta de Cores

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul principal | #2563EB | Botões, links, elementos ativos |
| Verde sucesso | #16A34A | Botão Analisar, scores altos |
| Amarelo/Laranja | #F59E0B | Scores médios |
| Laranja | #F97316 | Scores baixos, alertas |
| Roxo | #8B5CF6 | Indicadores específicos |
| Fundo | #F8FAFC | Background geral |
| Cards | #FFFFFF | Background dos cards |
| Bordas | #E2E8F0 | Divisores e bordas |
| Texto primário | #0F172A | Títulos e texto principal |
| Texto secundário | #64748B | Subtítulos e descrições |

---

## 📝 Notas Importantes

1. **Dados Mockados:** Todos os dados estão centralizados em `src/data/mockDashboard.ts` para fácil substituição.

2. **Google Maps:** É necessário ter uma chave de API válida. O componente mostra loading state enquanto carrega.

3. **Ícones:** Utilizamos Lucide React, já instalado no projeto.

4. **Gráficos:** Recharts já estava instalado, mantivemos a biblioteca.

5. **Responsividade:** Prioridade é desktop, mas funciona em mobile com menu recolhível.

6. **Estado:** Todos os filtros são gerenciados via estado React e podem ser facilmente conectados a APIs.

7. **Funcionalidade Real:** Selects, sliders e botões são 100% funcionais, não apenas visuais.

---

## 🔧 Troubleshooting

### Mapa não carrega
- Verifique se a variável `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está configurada
- Confirme que a API Key tem permissão para Maps JavaScript API

### Erro de compilação TypeScript
- Execute: `npm install`
- Verifique se todos os imports estão corretos

### Estilos não aparecem
- Confirme que o `tailwind.config.js` inclui todos os paths
- Execute: `npm run dev` novamente

---

## 👨‍💻 Próximos Passos Sugeridos

1. Conectar com backend Python (FastAPI)
2. Implementar autenticação de usuários
3. Adicionar animações de transição entre estados
4. Implementar cache de dados
5. Adicionar testes unitários
6. Implementar heatmap real no mapa
7. Adicionar exportação de relatórios PDF
8. Implementar histórico de análises

---

## 📦 Dependências Utilizadas

- **Next.js 14** - Framework React
- **React 18** - Biblioteca UI
- **Tailwind CSS** - Estilização
- **@react-google-maps/api** - Integração Google Maps
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **TypeScript** - Tipagem estática

---

**Desenvolvido para o projeto Radar de Oportunidades - Smart Cities 2024**
