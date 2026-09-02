# 📊 Sistema de Pontuação - Radar de Oportunidades

## Como funciona o Score?

O sistema agora gera pontuações **consistentes e realistas** baseadas em:

---

## 🎯 Fatores de Cálculo

### 1. Localização (Distância do Centro de SP)

| Distância | Região | Bônus Score | Características |
|-----------|--------|-------------|-----------------|
| < 0.02° | Centro/Paulista | +20 pontos | Alta densidade, muito movimento |
| 0.02-0.05° | Zona Intermediária | +15 pontos | Boa infraestrutura |
| 0.05-0.10° | Zona Próxima | +10 pontos | Infraestrutura média |
| 0.10-0.20° | Zona Afastada | +5 pontos | Infraestrutura básica |
| > 0.20° | Periferia | -5 pontos | Infraestrutura limitada |

### 2. Tipo de Negócio

| Negócio | Bônus | Motivo |
|---------|-------|--------|
| Farmácia | +6 | Essencial, alta demanda |
| Padaria | +7 | Alta frequência de uso |
| Cafeteria | +5 | Popular em áreas urbanas |
| Academia | +4 | Crescimento do fitness |
| Restaurante | +3 | Alta concorrência |
| Pet Shop | +2 | Nicho específico |
| Barbearia | +1 | Serviço comum |
| Loja de Roupas | 0 | Mercado saturado |

---

## 📈 Métricas Detalhadas

### População
- **Centro**: 85.0 pontos (85 mil habitantes)
- **Intermediário**: 78.0 pontos (62 mil habitantes)
- **Próximo**: 70.0 pontos (45 mil habitantes)
- **Afastado**: 58.0 pontos (28 mil habitantes)
- **Periferia**: 45.0 pontos (15 mil habitantes)

### Poder de Compra (Renda Média)
- **Centro**: 88.0 pontos (R$ 7.500)
- **Intermediário**: 75.0 pontos (R$ 5.200)
- **Próximo**: 65.0 pontos (R$ 3.800)
- **Afastado**: 52.0 pontos (R$ 2.900)
- **Periferia**: 40.0 pontos (R$ 2.100)

### Concorrência
**⚠️ Quanto MENOR o número, MAIS concorrentes!**

- **Centro**: 45.0 pontos (muitos concorrentes)
- **Intermediário**: 60.0 pontos (concorrência média)
- **Próximo**: 70.0 pontos (concorrência baixa)
- **Afastado**: 75.0 pontos (poucos concorrentes)
- **Periferia**: 82.0 pontos (quase sem concorrentes)

### Fluxo de Pessoas
- **Centro**: 90.0 pontos (altíssimo movimento)
- **Intermediário**: 72.0 pontos (bom movimento)
- **Próximo**: 60.0 pontos (movimento moderado)
- **Afastado**: 48.0 pontos (movimento baixo)
- **Periferia**: 35.0 pontos (pouco movimento)

---

## 🎲 Fórmula do Score Final

```
Score Base = 60.0

+ Bônus por Localização (até +20)
+ Bônus por Tipo de Negócio (até +7)
- Penalidade por Periferia (-5)

Score Final = min(95, max(30, Score Total))
```

**Range:** 30.0 a 95.0 pontos (sempre com 1 casa decimal)

---

## 🛡️ Níveis de Risco

| Score | Risco | ROI Estimado | Descrição |
|-------|-------|--------------|-----------|
| 75-95 | **Baixo** | 18% a 35% a.a. | Excelente oportunidade |
| 60-74 | **Baixo** | 12% a 25% a.a. | Boa oportunidade |
| 45-59 | **Médio** | 5% a 15% a.a. | Oportunidade moderada |
| 30-44 | **Alto** | 0% a 8% a.a. | Requer estratégia |
| < 30 | **Alto** | Negativo | Não recomendado |

---

## 💼 Recomendações por Score

### ✅ 75-95: Fortemente Recomendado
- Alta probabilidade de sucesso
- Bom retorno no investimento
- Vá em frente com confiança

### 👍 60-74: Recomendado
- Boa oportunidade
- Riscos gerenciáveis
- Faça planejamento adequado

### ⚠️ 45-59: Análise Cuidadosa
- Oportunidade moderada
- Riscos relevantes
- Desenvolva diferenciação

### 🔶 30-44: Não Recomendado
- Sem estratégia específica
- Alta concorrência ou perfil desfavorável
- Considere outras regiões

### ❌ < 30: Alto Risco
- Reconsidere a decisão
- Busque outras alternativas
- Altamente desencorajado

---

## 🔢 Formato dos Números

Todos os scores agora usam **1 casa decimal**:
- Score: `75.3` (não `75.312`)
- Métricas: `85.0` (não `85`)
- Delta: `+12.5` (não `+12.512`)

---

## 🗺️ Exemplo Prático

**Local:** Avenida Paulista, 1000  
**Coordenadas:** -23.5505, -46.6333  
**Negócio:** Cafeteria  
**Orçamento:** R$ 150.000

### Cálculo:
```
Base: 60.0
+ Localização (Centro): +20.0
+ Cafeteria: +5.0
= 85.0 pontos ✅
```

### Métricas:
- População: 85.0 (alta densidade)
- Poder de Compra: 88.0 (renda alta)
- Concorrência: 45.0 (muitos concorrentes)
- Fluxo: 90.0 (altíssimo movimento)

### Resultado:
- **Score:** 85.0/100
- **Risco:** Baixo
- **ROI:** 18% a 35% a.a.
- **Recomendação:** ✅ Fortemente recomendado

---

## 🚀 Com IA (Groq/Llama 3)

Se você configurar a chave do Groq (GRÁTIS), a análise fica ainda melhor:

✅ Explicação personalizada e detalhada  
✅ Análise de pontos fortes e fracos  
✅ Recomendações estratégicas específicas  
✅ Insights sobre o mercado local  
✅ Avaliação SWOT completa  

---

**Agora os dados são consistentes e realistas!** 🎯
