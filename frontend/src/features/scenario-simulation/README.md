# 📊 Feature: Simulador de Cenários

## Visão Geral

Permite simular diferentes cenários de mercado para avaliar como mudanças populacionais, econômicas e competitivas afetam o score de oportunidade nos próximos 5 anos.

## Funcionalidades

- ✅ Simulação de crescimento populacional (-20% a +20%)
- ✅ Simulação de variação de renda (-30% a +30%)
- ✅ Previsão de entrada de novos concorrentes
- ✅ Cálculo de score futuro (1-5 anos)
- ✅ Gráfico interativo de tendências
- ✅ Comparação de múltiplos cenários

## Arquivo Principal

`src/components/ScenarioSimulation.tsx`

## Props

```typescript
interface Props {
  initialRegion: string      // Região inicial (opcional)
  initialBusiness: string    // Tipo de negócio inicial (opcional)
}
```

## Estado Interno

```typescript
const [region, setRegion] = useState('')
const [business, setBusiness] = useState('')
const [populationGrowth, setPopulationGrowth] = useState(0)  // -20 a +20
const [incomeChange, setIncomeChange] = useState(0)          // -30 a +30
const [newCompetitors, setNewCompetitors] = useState(0)      // 0 a 10
const [simulationResult, setSimulationResult] = useState<any>(null)
const [loading, setLoading] = useState(false)
```

## Fluxo de Funcionamento

```
1. Usuário seleciona região e negócio
   ↓
2. Usuário ajusta sliders de simulação
   - Crescimento populacional
   - Variação de renda
   - Novos concorrentes
   ↓
3. Sistema calcula score futuro
   ↓
4. Gráfico exibe projeção de 5 anos
   ↓
5. Usuário pode ajustar e recalcular
```

## Cálculo do Score

### Fórmula Básica
```typescript
scoreBase = 75 // Score inicial médio

// Impacto do crescimento populacional
scorePopulation = scoreBase * (1 + populationGrowth / 100)

// Impacto da variação de renda
scoreIncome = scorePopulation * (1 + incomeChange / 100)

// Impacto de novos concorrentes
scoreFinal = scoreIncome * (1 - newCompetitors * 0.05)

// Limitar entre 0-100
scoreFinal = Math.max(0, Math.min(100, scoreFinal))
```

### Exemplo
```
Score Base: 75
População: +10%  → 75 * 1.10 = 82.5
Renda: +5%       → 82.5 * 1.05 = 86.6
Concorrentes: 2  → 86.6 * (1 - 0.10) = 78
Score Final: 78
```

## Componentes do Gráfico

### Biblioteca Utilizada
- **Recharts**: Biblioteca de gráficos React
- Instalação: `npm install recharts`

### Exemplo de Uso
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const data = [
  { year: 'Ano 1', score: 75 },
  { year: 'Ano 2', score: 78 },
  { year: 'Ano 3', score: 80 },
  { year: 'Ano 4', score: 82 },
  { year: 'Ano 5', score: 85 }
]

<LineChart data={data}>
  <Line type="monotone" dataKey="score" stroke="#3b82f6" />
</LineChart>
```

## Como Modificar

### Adicionar novo parâmetro de simulação

```typescript
// 1. Adicionar estado
const [novoParametro, setNovoParametro] = useState(0)

// 2. Adicionar slider no formulário
<div>
  <label>🆕 Novo Parâmetro</label>
  <input
    type="range"
    min="0"
    max="100"
    value={novoParametro}
    onChange={(e) => setNovoParametro(Number(e.target.value))}
  />
</div>

// 3. Incluir no cálculo
scoreFinal = scoreFinal * (1 + novoParametro / 100)
```

### Mudar período de projeção

Atualmente: **5 anos**

```typescript
// Mudar para 10 anos
const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const projectionData = years.map(year => ({
  year: `Ano ${year}`,
  score: calculateFutureScore(year)
}))
```

### Adicionar cenário pré-definido

```typescript
const scenarios = {
  otimista: {
    populationGrowth: 15,
    incomeChange: 20,
    newCompetitors: 0
  },
  pessimista: {
    populationGrowth: -10,
    incomeChange: -15,
    newCompetitors: 5
  },
  realista: {
    populationGrowth: 5,
    incomeChange: 3,
    newCompetitors: 2
  }
}

// Aplicar cenário
const applyScenario = (name: string) => {
  const scenario = scenarios[name]
  setPopulationGrowth(scenario.populationGrowth)
  setIncomeChange(scenario.incomeChange)
  setNewCompetitors(scenario.newCompetitors)
}
```

## APIs do Backend

### Endpoint Principal

```typescript
POST /api/simulate-scenario

Body: {
  region: string,
  business_type: string,
  population_growth: number,    // percentual
  income_change: number,        // percentual
  new_competitors: number       // quantidade
}

Response: {
  current_score: number,
  future_scores: {
    year_1: number,
    year_2: number,
    year_3: number,
    year_4: number,
    year_5: number
  },
  factors: {
    population_impact: number,
    income_impact: number,
    competition_impact: number
  }
}
```

## Cenários de Exemplo

### 1. Crescimento Acelerado
```
População: +15%
Renda: +20%
Concorrentes: +1
Resultado: Score aumenta de 75 → 95
```

### 2. Recessão Econômica
```
População: -5%
Renda: -15%
Concorrentes: +3
Resultado: Score diminui de 75 → 52
```

### 3. Saturação de Mercado
```
População: +10%
Renda: +10%
Concorrentes: +8
Resultado: Score diminui de 75 → 55 (muita concorrência)
```

## Troubleshooting

### Gráfico não aparece
**Causa:** Recharts não instalado

**Solução:**
```bash
cd frontend
npm install recharts
```

### Score fica negativo
**Causa:** Parâmetros muito extremos

**Solução:** Adicionar validação
```typescript
const scoreFinal = Math.max(0, Math.min(100, calculatedScore))
```

### Simulação não realista
**Causa:** Multiplicadores muito altos

**Solução:** Ajustar pesos dos fatores
```typescript
// Reduzir impacto de concorrentes
scoreFinal = scoreIncome * (1 - newCompetitors * 0.03) // era 0.05
```

## Melhorias Futuras

- [ ] Salvar e comparar múltiplos cenários
- [ ] Exportar simulação em PDF
- [ ] Dados históricos reais (IBGE)
- [ ] Machine Learning para previsões
- [ ] Análise de sensibilidade
- [ ] Simulação Monte Carlo (probabilística)
- [ ] Intervalo de confiança nas projeções
- [ ] Benchmarking com dados reais

## Fórmulas Avançadas

### Crescimento Composto
```typescript
// Crescimento ano a ano (mais realista)
const calculateCompoundGrowth = (initialScore: number, rate: number, years: number) => {
  return initialScore * Math.pow(1 + rate / 100, years)
}
```

### Decaimento de Impacto
```typescript
// Impacto diminui ao longo do tempo
const decayFactor = (year: number) => Math.exp(-0.1 * year)
const adjustedImpact = baseImpact * decayFactor(year)
```

## Desenvolvedor Responsável

**Nome:** [SEU NOME]  
**Contato:** [SEU EMAIL/DISCORD]  
**Última atualização:** Agosto 2026
