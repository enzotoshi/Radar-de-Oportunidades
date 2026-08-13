# 🎮 Feature: Modo Investidor (Gamificação)

## Visão Geral

Sistema de gamificação que transforma a análise de oportunidades em um jogo competitivo com pontos, rankings, conquistas e desafios de investimento.

## Funcionalidades

- ✅ Sistema de pontuação (XP)
- ✅ Níveis de investidor (Iniciante → Expert)
- ✅ Rankings e leaderboards
- ✅ Conquistas e badges
- ✅ Desafios diários/semanais
- ✅ Histórico de investimentos
- ✅ Modo competitivo (PvP)

## Arquivo Principal

`src/components/Gamification.tsx`

## Props

```typescript
interface Props {
  // Nenhuma prop obrigatória
  // Feature independente com estado próprio
}
```

## Estado Interno

```typescript
const [userLevel, setUserLevel] = useState(1)           // Nível do jogador
const [userXP, setUserXP] = useState(0)                 // Experiência acumulada
const [achievements, setAchievements] = useState([])    // Conquistas desbloqueadas
const [leaderboard, setLeaderboard] = useState([])      // Ranking global
const [dailyChallenge, setDailyChallenge] = useState(null) // Desafio do dia
const [investmentHistory, setInvestmentHistory] = useState([]) // Histórico
```

## Sistema de Pontuação

### Como Ganhar XP

| Ação | XP Ganho |
|------|----------|
| Analisar um local | 50 XP |
| Fazer simulação | 30 XP |
| Investir em oportunidade | 100 XP |
| Completar desafio diário | 200 XP |
| Acertar previsão | 500 XP |
| Compartilhar análise | 25 XP |

### Níveis de Investidor

```typescript
const levels = [
  { level: 1, title: 'Iniciante', xpRequired: 0 },
  { level: 2, title: 'Aprendiz', xpRequired: 500 },
  { level: 3, title: 'Intermediário', xpRequired: 1500 },
  { level: 4, title: 'Avançado', xpRequired: 3500 },
  { level: 5, title: 'Expert', xpRequired: 7500 },
  { level: 6, title: 'Mestre', xpRequired: 15000 },
  { level: 7, title: 'Lendário', xpRequired: 30000 }
]
```

### Cálculo de Progresso

```typescript
const calculateProgress = (currentXP: number, level: number) => {
  const currentLevel = levels[level - 1]
  const nextLevel = levels[level]
  
  const xpInLevel = currentXP - currentLevel.xpRequired
  const xpNeeded = nextLevel.xpRequired - currentLevel.xpRequired
  
  return (xpInLevel / xpNeeded) * 100
}
```

## Sistema de Conquistas

### Tipos de Conquistas

```typescript
const achievements = [
  {
    id: 'first_analysis',
    title: '🔍 Primeira Análise',
    description: 'Complete sua primeira análise de local',
    xp: 100,
    unlocked: false
  },
  {
    id: 'explorer',
    title: '🗺️ Explorador',
    description: 'Analise 10 locais diferentes',
    xp: 500,
    unlocked: false
  },
  {
    id: 'wise_investor',
    title: '💎 Investidor Sábio',
    description: 'Invista em 5 oportunidades com score > 80',
    xp: 1000,
    unlocked: false
  },
  {
    id: 'prophet',
    title: '🔮 Profeta',
    description: 'Acerte 3 previsões de cenário',
    xp: 2000,
    unlocked: false
  },
  {
    id: 'serial_analyzer',
    title: '📊 Analista Serial',
    description: 'Faça análises por 7 dias seguidos',
    xp: 1500,
    unlocked: false
  }
]
```

### Desbloquear Conquista

```typescript
const unlockAchievement = (achievementId: string) => {
  const achievement = achievements.find(a => a.id === achievementId)
  
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true
    setUserXP(prev => prev + achievement.xp)
    
    // Notificação
    showNotification(`🎉 Conquista desbloqueada: ${achievement.title}`)
  }
}
```

## Ranking (Leaderboard)

### Estrutura de Dados

```typescript
interface LeaderboardEntry {
  rank: number
  username: string
  level: number
  xp: number
  totalInvestments: number
  successRate: number  // % de investimentos bem-sucedidos
  avatar: string
}
```

### Exemplo de Ranking

```typescript
const leaderboard = [
  {
    rank: 1,
    username: 'InvestMaster',
    level: 7,
    xp: 35000,
    totalInvestments: 87,
    successRate: 92,
    avatar: '👑'
  },
  {
    rank: 2,
    username: 'SmartInvestor',
    level: 6,
    xp: 22000,
    totalInvestments: 54,
    successRate: 88,
    avatar: '💎'
  },
  // ... mais usuários
]
```

## Desafios

### Desafio Diário

```typescript
const dailyChallenges = [
  {
    id: 'daily_1',
    title: '🎯 Caça ao Tesouro',
    description: 'Encontre uma oportunidade com score acima de 85',
    reward: 200,
    progress: 0,
    target: 1,
    expiresAt: '2026-08-14T23:59:59'
  },
  {
    id: 'daily_2',
    title: '📈 Otimista',
    description: 'Simule 3 cenários com crescimento positivo',
    reward: 150,
    progress: 0,
    target: 3,
    expiresAt: '2026-08-14T23:59:59'
  }
]
```

### Desafio Semanal

```typescript
const weeklyChallenges = [
  {
    id: 'weekly_1',
    title: '🌟 Explorador Incansável',
    description: 'Analise 20 locais diferentes em 7 dias',
    reward: 1000,
    progress: 0,
    target: 20,
    expiresAt: '2026-08-20T23:59:59'
  }
]
```

## Como Modificar

### Adicionar nova conquista

```typescript
const newAchievement = {
  id: 'novo_badge',
  title: '🆕 Nome da Conquista',
  description: 'Descrição do que precisa fazer',
  xp: 500,
  unlocked: false,
  icon: '🏆'
}

achievements.push(newAchievement)
```

### Ajustar XP de ações

```typescript
// No arquivo de configuração
const XP_REWARDS = {
  ANALYZE_LOCATION: 50,      // Altere aqui
  SIMULATE_SCENARIO: 30,
  MAKE_INVESTMENT: 100,
  DAILY_CHALLENGE: 200,
  CORRECT_PREDICTION: 500
}
```

### Adicionar novo nível

```typescript
levels.push({
  level: 8,
  title: 'Deus dos Investimentos',
  xpRequired: 50000,
  benefits: ['Análises ilimitadas', 'Acesso a dados premium']
})
```

## Modo Competitivo (PvP)

### Duelo de Investidores

```typescript
interface Duel {
  id: string
  player1: string
  player2: string
  challenge: string  // "Quem acha a melhor oportunidade em 5 min"
  status: 'pending' | 'active' | 'completed'
  winner: string | null
  stakes: number  // XP em jogo
}
```

### Criar Duelo

```typescript
const createDuel = (opponent: string, challenge: string, stakes: number) => {
  return {
    id: generateId(),
    player1: currentUser,
    player2: opponent,
    challenge,
    status: 'pending',
    winner: null,
    stakes
  }
}
```

## APIs do Backend

### Endpoint: Salvar Progresso

```typescript
POST /api/gamification/save-progress

Body: {
  user_id: string,
  xp: number,
  level: number,
  achievements: string[],
  investment_history: Investment[]
}

Response: {
  success: boolean,
  new_achievements: string[]  // Conquistas desbloqueadas
}
```

### Endpoint: Obter Ranking

```typescript
GET /api/gamification/leaderboard?limit=50

Response: {
  leaderboard: LeaderboardEntry[],
  user_rank: number,
  total_players: number
}
```

## Notificações

### Sistema de Notificações

```typescript
const notifications = [
  {
    type: 'achievement',
    title: '🎉 Nova Conquista!',
    message: 'Você desbloqueou: Explorador',
    timestamp: Date.now()
  },
  {
    type: 'level_up',
    title: '🆙 Level Up!',
    message: 'Você atingiu o nível 5: Expert',
    timestamp: Date.now()
  },
  {
    type: 'challenge',
    title: '🎯 Novo Desafio!',
    message: 'Desafio diário disponível',
    timestamp: Date.now()
  }
]
```

## Troubleshooting

### XP não está salvando
**Causa:** Backend não implementado ou localStorage cheio

**Solução:**
```typescript
// Salvar em localStorage temporariamente
localStorage.setItem('userXP', JSON.stringify(userXP))
localStorage.setItem('userLevel', JSON.stringify(userLevel))
```

### Ranking não atualiza
**Causa:** Cache de dados antigos

**Solução:**
```typescript
// Forçar refresh do ranking
const refreshLeaderboard = async () => {
  const response = await fetch('/api/gamification/leaderboard?_=' + Date.now())
  const data = await response.json()
  setLeaderboard(data.leaderboard)
}
```

### Conquistas duplicadas
**Causa:** Verificação incorreta de unlock

**Solução:**
```typescript
// Verificar se já está desbloqueada
if (!achievement.unlocked) {
  unlockAchievement(achievementId)
}
```

## Melhorias Futuras

- [ ] Sistema de clãs/grupos
- [ ] Torneios mensais
- [ ] Loja de itens com XP
- [ ] Sistema de referral (indicar amigos)
- [ ] Análise de performance histórica
- [ ] Badges animados
- [ ] Troféus físicos para top 3
- [ ] Integração com redes sociais
- [ ] NFTs de conquistas (blockchain)
- [ ] Battle Pass sazonal

## Desenvolvedor Responsável

**Nome:** [SEU NOME]  
**Contato:** [SEU EMAIL/DISCORD]  
**Última atualização:** Agosto 2026
