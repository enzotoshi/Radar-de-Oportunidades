# 🎉 Nova Funcionalidade: Busca por Endereço Personalizado

## ✨ O que foi adicionado

### 📍 Campo de Busca de Endereço
Agora você pode digitar **qualquer endereço** e o sistema analisa a área automaticamente!

**Como usar:**
1. Selecione o tipo de negócio
2. Digite o endereço no campo "Ou busque um endereço específico"
3. Clique no botão roxo ou aperte Enter
4. O sistema analisa a área em um **raio de 1 km**

**Exemplos de endereços:**
- `Av. Paulista, 1000 - São Paulo`
- `Rua Oscar Freire, 500 - Jardins`
- `Shopping Ibirapuera, São Paulo`
- `Parque do Ibirapuera`

## 🔍 O que o sistema analisa

Quando você busca um endereço, o sistema vasculha **1 km ao redor** e analisa:

### 🏪 Concorrência
- Quantos concorrentes existem na área
- Nível de concorrência (baixo, médio, alto)
- Rating médio dos concorrentes

### 🏗️ Infraestrutura (Score 0-100)
- Facilidades próximas
- Qualidade da infraestrutura

### 🚌 Mobilidade (Score 0-100)
- Opções de transporte público
- Acessibilidade da área

### 📊 Score de Oportunidade (0-100)
Calculado com base em todos os fatores acima

## 🎯 Comparação: 3 Formas de Análise

| Método | Quando usar | Tempo |
|--------|-------------|-------|
| **Regiões Predefinidas** | Análise rápida de bairros conhecidos | Instantâneo |
| **AI Hotspots** | Encontrar os 10 melhores locais automaticamente | ~30-60s |
| **Busca por Endereço** | Analisar um local específico que você escolheu | ~10-15s |

## 🚀 Como Testar Agora

1. **Certifique-se que o backend está rodando:**
   - Terminal backend: `python -m uvicorn main:app --reload`

2. **Certifique-se que o frontend está rodando:**
   - Terminal frontend: `npm run dev`

3. **Acesse:** http://localhost:3000

4. **Teste a busca:**
   - Selecione "Cafeteria" como negócio
   - Digite: `Avenida Paulista, 1000 - São Paulo`
   - Clique no botão roxo
   - Aguarde a análise

## 📝 Observações

- ✅ Usa dados **reais** do Google Maps
- ✅ Análise em **raio de 1 km**
- ✅ Autocomplete do Google (sugestões de endereço)
- ✅ Score calculado com base em dados reais
- ⚠️ Requer chave do Google Maps configurada

## 🎨 Interface

**Campo de busca:**
- Campo de texto para digitar o endereço
- Botão roxo com ícone de pin
- Suporta Enter para buscar

**Resultado:**
- Card roxo com análise completa
- Score grande e destacado
- Detalhes de concorrência, infraestrutura e mobilidade
- Indicador de fonte de dados (Real/Simulado)

---

**Pronto para testar! 🚀**
