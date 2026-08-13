# 👥 Guia de Colaboração em Equipe

## 🎯 Visão Geral

Este projeto está dividido em **3 features independentes** para permitir que vários desenvolvedores trabalhem simultaneamente sem conflitos de código.

## 📁 Estrutura do Projeto

```
frontend/src/
├── features/                    # 🎯 Features separadas
│   ├── map-analysis/           # Feature 1: Análise de Mapa
│   │   ├── index.ts
│   │   └── README.md
│   │
│   ├── scenario-simulation/    # Feature 2: Simulador de Cenários
│   │   ├── index.ts
│   │   └── README.md
│   │
│   └── investor-mode/          # Feature 3: Modo Investidor
│       ├── index.ts
│       └── README.md
│
├── components/                  # 📦 Componentes atuais
│   ├── MapAnalysis.tsx         # Implementação da Feature 1
│   ├── ScenarioSimulation.tsx  # Implementação da Feature 2
│   ├── Gamification.tsx        # Implementação da Feature 3
│   ├── MapComponent.tsx        # Compartilhado
│   ├── VoiceInput.tsx          # Compartilhado
│   └── MainApp.tsx             # Orquestrador principal
│
├── lib/                        # 🔧 Utilitários
│   ├── api.ts                  # Chamadas ao backend
│   └── data.ts                 # Dados estáticos
│
└── types/                      # 📝 TypeScript types
    └── index.ts
```

## 👨‍💻 Divisão de Responsabilidades

### Desenvolvedor A - Análise de Mapa 🗺️

**Arquivo principal:** `frontend/src/components/MapAnalysis.tsx`

**Responsabilidades:**
- Busca e geocoding de endereços
- Análise de oportunidades (raio 1km)
- Visualização de resultados
- Integração com Google Maps

**Pode modificar:**
- ✅ `MapAnalysis.tsx`
- ✅ `MapComponent.tsx` (com comunicação)
- ✅ `features/map-analysis/README.md`

**NÃO deve modificar:**
- ❌ `ScenarioSimulation.tsx`
- ❌ `Gamification.tsx`
- ❌ `MainApp.tsx` (sem coordenação)

---

### Desenvolvedor B - Simulador de Cenários 📊

**Arquivo principal:** `frontend/src/components/ScenarioSimulation.tsx`

**Responsabilidades:**
- Simulações de população e renda
- Previsão de concorrentes
- Gráficos de projeção
- Cálculo de scores futuros

**Pode modificar:**
- ✅ `ScenarioSimulation.tsx`
- ✅ `features/scenario-simulation/README.md`

**NÃO deve modificar:**
- ❌ `MapAnalysis.tsx`
- ❌ `Gamification.tsx`
- ❌ `MainApp.tsx` (sem coordenação)

---

### Desenvolvedor C - Modo Investidor 🎮

**Arquivo principal:** `frontend/src/components/Gamification.tsx`

**Responsabilidades:**
- Sistema de pontuação (XP)
- Conquistas e badges
- Rankings
- Desafios

**Pode modificar:**
- ✅ `Gamification.tsx`
- ✅ `features/investor-mode/README.md`

**NÃO deve modificar:**
- ❌ `MapAnalysis.tsx`
- ❌ `ScenarioSimulation.tsx`
- ❌ `MainApp.tsx` (sem coordenação)

---

## 🔄 Fluxo de Trabalho

### 1. Antes de Começar

```bash
# 1. Atualizar código
git pull origin main

# 2. Criar branch da sua feature
git checkout -b feature/map-analysis
# ou
git checkout -b feature/scenario-simulation
# ou
git checkout -b feature/investor-mode

# 3. Instalar dependências (se necessário)
cd frontend
npm install
```

### 2. Durante o Desenvolvimento

```bash
# Trabalhe APENAS no seu arquivo
# Exemplo para Desenvolvedor A:
code src/components/MapAnalysis.tsx

# Teste localmente
npm run dev

# Acesse: http://localhost:3000
```

### 3. Commits e Push

```bash
# Adicionar APENAS seus arquivos
git add src/components/MapAnalysis.tsx
git add src/features/map-analysis/README.md

# Commit com mensagem clara
git commit -m "feat(map-analysis): adiciona filtro de raio de busca"

# Push para o GitHub
git push origin feature/map-analysis
```

### 4. Pull Request

1. Acesse GitHub
2. Crie Pull Request da sua branch → `main`
3. Adicione descrição do que foi feito
4. Solicite review de outro desenvolvedor
5. Aguarde aprovação antes de fazer merge

---

## 🚨 Evitando Conflitos

### ✅ PODE fazer sozinho:

- Editar seu componente principal
- Adicionar novos estados internos
- Criar funções auxiliares
- Atualizar README da sua feature
- Adicionar novos estilos CSS

### ⚠️ PRECISA coordenar:

- Modificar `MainApp.tsx`
- Alterar `types/index.ts`
- Mudar `lib/api.ts`
- Editar `lib/data.ts`
- Modificar componentes compartilhados

### Como coordenar:

1. **Avise no grupo** antes de modificar
2. **Crie issue no GitHub** descrevendo a mudança
3. **Aguarde aprovação** de outros devs
4. **Faça a mudança**
5. **Notifique quando terminar**

---

## 📞 Comunicação

### Canal de Discord/Slack

```
#geral           → Discussões gerais
#map-analysis    → Dúvidas sobre Feature 1
#simulation      → Dúvidas sobre Feature 2
#investor-mode   → Dúvidas sobre Feature 3
#bugs            → Reportar problemas
```

### Daily Standup (Opcional)

**Quando:** Todos os dias, 10h
**Duração:** 15 minutos

Cada dev responde:
1. O que fiz ontem?
2. O que vou fazer hoje?
3. Estou bloqueado em algo?

---

## 🐛 Troubleshooting

### Conflito de Merge

```bash
# Se aparecer conflito ao fazer pull
git pull origin main

# Resolver conflito manualmente
# Editar arquivos marcados com <<<<<<

# Depois de resolver
git add .
git commit -m "fix: resolve conflito de merge"
```

### Código de outra pessoa quebrou minha feature

1. **NÃO corrija direto** no código da pessoa
2. **Crie issue no GitHub** explicando o problema
3. **Marque o desenvolvedor** responsável
4. **Aguarde correção** ou faça pair programming

### Preciso de função de outra feature

**ERRADO:**
```typescript
// ❌ Copiar código de outro arquivo
```

**CERTO:**
```typescript
// ✅ Criar função compartilhada
// 1. Criar em lib/utils.ts
export const calculaScore = (params) => { ... }

// 2. Importar onde precisar
import { calculaScore } from '@/lib/utils'
```

---

## 📦 Adicionando Dependências

### Dependências NPM

```bash
# 1. Avisar no grupo antes
# 2. Instalar
npm install nome-da-lib

# 3. Commitar package.json
git add package.json package-lock.json
git commit -m "chore: adiciona biblioteca X"
```

### Bibliotecas Comuns

- **Gráficos:** `recharts`
- **Mapas:** `@react-google-maps/api`
- **Animações:** `framer-motion` (já instalado)
- **Ícones:** `lucide-react` (já instalado)
- **Forms:** `react-hook-form`
- **State:** `zustand` ou `redux`

---

## 🧪 Testes

### Testando sua feature isoladamente

```typescript
// Criar arquivo de teste
// src/components/__tests__/MapAnalysis.test.tsx

import { render, screen } from '@testing-library/react'
import MapAnalysis from '../MapAnalysis'

test('deve renderizar campo de busca', () => {
  render(<MapAnalysis {...props} />)
  expect(screen.getByPlaceholderText(/endereço/i)).toBeInTheDocument()
})
```

### Rodar testes

```bash
npm test
# ou
npm test -- MapAnalysis.test.tsx
```

---

## 📋 Checklist antes do Pull Request

- [ ] Código funciona localmente
- [ ] Não quebrei outras features
- [ ] Adicionei comentários em código complexo
- [ ] Atualizei README da minha feature
- [ ] Removi console.logs de debug
- [ ] Testei em diferentes resoluções
- [ ] Commit messages são claras
- [ ] Branch está atualizada com main

---

## 🎨 Convenções de Código

### Naming

```typescript
// Componentes: PascalCase
const MapAnalysis = () => {}

// Funções: camelCase
const calculateScore = () => {}

// Constantes: UPPER_SNAKE_CASE
const API_TIMEOUT = 60000

// Interfaces: PascalCase com I
interface IAnalysisResult {}
```

### Imports

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. Bibliotecas externas
import { motion } from 'framer-motion'

// 3. Componentes internos
import MapComponent from './MapComponent'

// 4. Types
import type { AnalysisResult } from '@/types'

// 5. Utilitários
import { calculateScore } from '@/lib/utils'

// 6. Estilos
import './styles.css'
```

### Comentários

```typescript
// ✅ BOM: Explica o "porquê"
// Usamos 1km porque é a distância média que um cliente caminha
const SEARCH_RADIUS = 1000

// ❌ RUIM: Explica o óbvio
// Define o raio como 1000
const SEARCH_RADIUS = 1000
```

---

## 🚀 Deploy

### Ambiente de Desenvolvimento

```
URL: http://localhost:3000
Backend: http://localhost:8000
```

### Ambiente de Staging (Testes)

```
URL: https://staging.radar-oportunidades.com
Backend: https://api-staging.radar-oportunidades.com
```

### Produção

```
URL: https://radar-oportunidades.com
Backend: https://api.radar-oportunidades.com
```

**⚠️ ATENÇÃO:** Apenas o líder do projeto faz deploy em produção!

---

## 📚 Recursos Úteis

### Documentação

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion)

### Ferramentas

- [VS Code](https://code.visualstudio.com)
- [GitHub Desktop](https://desktop.github.com)
- [Postman](https://www.postman.com) (testar API)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## ❓ FAQ

**P: Posso modificar MainApp.tsx?**
R: Apenas com coordenação da equipe. É um arquivo compartilhado.

**P: Encontrei um bug em outra feature, posso corrigir?**
R: Crie uma issue primeiro e notifique o desenvolvedor responsável.

**P: Preciso adicionar uma prop nova no meu componente**
R: Pode adicionar livremente. Apenas documente no README.

**P: Esqueci de qual branch estou**
R: `git branch` mostra a branch atual.

**P: Fiz commit errado, como desfazer?**
R: `git reset HEAD~1` desfaz o último commit (mantém alterações).

**P: Backend não responde**
R: Verifique se está rodando: `cd backend && uvicorn main:app --reload`

---

## 📞 Contatos da Equipe

| Dev | Feature | Discord | Email |
|-----|---------|---------|-------|
| **Dev A** | Análise de Mapa | @devA | deva@email.com |
| **Dev B** | Simulador | @devB | devb@email.com |
| **Dev C** | Modo Investidor | @devC | devc@email.com |

---

**Última atualização:** Agosto 2026  
**Versão:** 1.0.0

Dúvidas? Pergunte no canal `#geral` do Discord! 🚀
