# 🎯 Radar de Oportunidades Inteligente

> Plataforma web que analisa o potencial de abertura de negócios em regiões de São Paulo usando Machine Learning, mapas interativos e gamificação.

Desenvolvido para a **Feira Científica Smart Cities 2024** — FECAP.

---

## ✨ Funcionalidades

| | |
|---|---|
| 🗺️ **Mapa Interativo** | 14 bairros com marcadores coloridos por score de oportunidade |
| 🤖 **Motor de ML** | Score 0–100 calculado com 6 métricas ponderadas por tipo de negócio |
| 📊 **Simulação de Cenários** | Projete o score em 5 anos ajustando população, renda e concorrência |
| 🎮 **Modo Investidor** | Jogo educativo com orçamento real e ranking de decisões |
| 🎙️ **Entrada por Voz** | Fale "cafeteria em Pinheiros, 100 mil reais" e o formulário se preenche |
| 🔌 **Modo Offline** | Funciona sem backend com cálculo local de fallback |

---

## 🚀 Como Rodar

### Backend (Python)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API disponível em `http://localhost:8000` · Docs em `http://localhost:8000/docs`

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Interface disponível em `http://localhost:3000`

> O frontend funciona **sem o backend** — há fallback automático com dados locais.

---

## 🧮 Como o Score é Calculado

O **Opportunity Score** (0–100) combina 6 fatores com pesos diferentes:

| Fator | Peso |
|---|---|
| Concorrência local | 25% |
| Perfil demográfico | 20% |
| Poder de compra | 20% |
| Tendências de consumo | 15% |
| Fluxo urbano | 10% |
| Viabilidade financeira | 10% |

---

## 🛠️ Stack

**Backend:** Python 3.11 · FastAPI · scikit-learn · Pandas · NumPy

**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · React Leaflet · Recharts · Framer Motion

---

## 📁 Estrutura

```
radar-oportunidades/
├── backend/
│   ├── main.py          # Endpoints FastAPI
│   ├── ml_engine.py     # Motor de ML + dados simulados
│   ├── models.py        # Schemas Pydantic
│   └── requirements.txt
└── frontend/
    └── src/
        ├── app/         # Layout e página raiz
        ├── components/  # MapAnalysis, Gamification, ScenarioSimulation...
        ├── lib/         # API client + dados de fallback
        └── types/       # Interfaces TypeScript
```

---

## 🗺️ Regiões Cobertas

Vila Madalena · Moema · Pinheiros · Jardins · Vila Olímpia · Centro · Liberdade · Lapa · Santana · Tatuapé · Consolação · Santo André · Campinas · ABC Paulista · Itaquera

---

> Feito com ❤️ usando FastAPI + Next.js · Dados simulados para fins educacionais.
