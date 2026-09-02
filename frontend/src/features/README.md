# 📁 Estrutura de Features

Este diretório contém as **3 funcionalidades principais** do Radar de Oportunidades, separadas para facilitar o desenvolvimento em equipe.

## 🗂️ Organização

```
features/
├── map-analysis/           # 🗺️ Análise de Mapa
│   ├── index.ts           # Exportação da feature
│   └── README.md          # Documentação específica
│
├── scenario-simulation/    # 📊 Simulador de Cenários  
│   ├── index.ts           # Exportação da feature
│   └── README.md          # Documentação específica
│
└── investor-mode/          # 🎮 Modo Investidor
    ├── index.ts           # Exportação da feature
    └── README.md          # Documentação específica
```

## 🎯 Features

### 1. 🗺️ Análise de Mapa (`map-analysis/`)

**O que faz:**
- Busca de endereços com geocoding (OpenStreetMap)
- Análise de oportunidades em raio de 1km
- Visualização de resultados no mapa interativo
- Exibição de concorrência, infraestrutura e mobilidade

**Arquivo principal:** `components/MapAnalysis.tsx`

**Desenvolvedor responsável:** [NOME]

---

### 2. 📊 Simulador de Cenários (`scenario-simulation/`)

**O que faz:**
- Simulação de crescimento populacional (%)
- Simulação de variação de renda (%)
- Previsão de entrada de novos concorrentes
- Projeções de score para os próximos 5 anos
- Gráficos interativos de tendências

**Arquivo principal:** `components/ScenarioSimulation.tsx`

**Desenvolvedor responsável:** [NOME]

---

### 3. 🎮 Modo Investidor (`investor-mode/`)

**O que faz:**
- Sistema de pontuação e gamificação
- Rankings de melhores investimentos
- Conquistas e desafios
- Modo competitivo entre usuários
- Histórico de decisões

**Arquivo principal:** `components/Gamification.tsx`

**Desenvolvedor responsável:** [NOME]

---

## 🚀 Como Trabalhar

### Desenvolvimento Individual

Cada desenvolvedor pode trabalhar em sua feature sem conflitos:

```bash
# Desenvolvedor A trabalhando em Análise de Mapa
cd frontend/src/components
code MapAnalysis.tsx

# Desenvolvedor B trabalhando em Simulador
cd frontend/src/components  
code ScenarioSimulation.tsx

# Desenvolvedor C trabalhando em Modo Investidor
cd frontend/src/components
code Gamification.tsx
```

### Importação no MainApp

O `MainApp.tsx` importa cada feature através dos índices:

```typescript
import { MapAnalysis } from '@/features/map-analysis'
import { ScenarioSimulation } from '@/features/scenario-simulation'
import { InvestorMode } from '@/features/investor-mode'
```

### Regras de Colaboração

1. **Não edite features de outros desenvolvedores** sem coordenação
2. **Mantenha os contratos de interface** (Props) consistentes
3. **Documente mudanças significativas** no README da feature
4. **Teste sua feature isoladamente** antes de integrar
5. **Comunique breaking changes** à equipe

---

## 🔄 Fluxo de Dados

```
MainApp.tsx (Estado Global)
     ↓
├─> MapAnalysis (Feature 1)
│   └─> Estado: selectedRegion, selectedBusiness, analysisResult
│
├─> ScenarioSimulation (Feature 2)  
│   └─> Estado: initialRegion, initialBusiness
│
└─> InvestorMode (Feature 3)
    └─> Estado: Independente (gamificação)
```

## 📝 Convenções

### Naming
- Componentes: `PascalCase` (ex: `MapAnalysis`)
- Arquivos: `PascalCase.tsx` (ex: `MapAnalysis.tsx`)
- Features: `kebab-case` (ex: `map-analysis/`)

### Estrutura de Props
Todas as features recebem props através de interfaces TypeScript:

```typescript
interface Props {
  // Props compartilhadas do MainApp
  selectedRegion: string
  setSelectedRegion: (v: string) => void
  // ... outras props
}
```

### Exports
Cada feature exporta através do `index.ts`:

```typescript
export { default as MapAnalysis } from '../../components/MapAnalysis'
```

---

## 🐛 Debugging

### Problemas Comuns

**Erro: Cannot find module '@/features/...'**
- Verifique se o caminho no `tsconfig.json` está correto
- Certifique-se que o arquivo `index.ts` existe na feature

**Erro: Props incompatíveis**
- Verifique a interface `Props` no componente
- Confira o que o `MainApp.tsx` está passando

**Conflitos de merge**
- Cada desenvolvedor trabalha em arquivo diferente
- Conflitos só ocorrem no `MainApp.tsx` (comunique changes)

---

## 📚 Documentação Adicional

- [Guia de Estilo](../../docs/STYLE_GUIDE.md)
- [API Backend](../../../../backend/README.md)
- [Configuração do Projeto](../../../README.md)

---

**Última atualização:** Agosto 2026  
**Versão:** 2.0.0
