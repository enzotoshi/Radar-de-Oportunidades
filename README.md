# 🎯 Radar de Oportunidades Inteligente

> Plataforma web que analisa o potencial de abertura de negócios em regiões de São Paulo usando Machine Learning, mapas interativos e gamificação. **Integrado com OpenAI, IBGE e Google Cloud.**

Desenvolvido para a **Feira Científica Smart Cities 2026** — FECAP.

---

## ✨ Funcionalidades

| | |
|---|---|
| 🎯 **ANÁLISE REAL DE MERCADO** | **Busca concorrentes reais, infraestrutura e mobilidade com Google Places API** |
| 🗺️ **Mapas Google Maps** | 14 bairros com marcadores coloridos e mapas interativos avançados |
| 🤖 **IA com OpenAI** | Explicações inteligentes e personalizadas geradas por GPT-4 |
| 📊 **Dados Reais IBGE** | População e PIB per capita oficiais de municípios brasileiros |
| 🎙️ **Speech-to-Text** | Transcrição precisa de áudio com Google Cloud Speech |
| 📈 **Motor de ML Híbrido** | Score 0–100 combinando dados reais + algoritmo ponderado |
| 🎮 **Simulação de Cenários** | Projete o score em 5 anos com insights de IA |
| 💼 **Modo Investidor** | Jogo educativo com orçamento real e ranking de decisões |
| 🔌 **Modo Fallback** | Funciona mesmo sem APIs configuradas - 100% resiliente |

---

## 🔌 APIs Integradas

| API | Status | Funcionalidade |
|-----|--------|----------------|
| **Google Places API** | 🔥 Essencial | **Análise REAL de concorrentes e mercado** |
| **OpenAI GPT-4** | Opcional | Explicações inteligentes sobre oportunidades |
| **Google Maps** | Recomendado | Mapas interativos avançados |
| **Google Speech** | Opcional | Transcrição de áudio para texto |
| **IBGE** | Gratuito | Dados demográficos oficiais |

> **🎯 NOVIDADE: Análise Real de Mercado!**  
> Com Google Places API, o sistema agora analisa **concorrentes reais**, infraestrutura e mobilidade da área!  
> **📖 [Saiba mais sobre a Análise Real →](./REAL_ANALYSIS.md)**

> **📖 [Guia Completo de Configuração das APIs →](./API_SETUP.md)**

**Todas as APIs têm modo fallback automático!** O sistema funciona completamente mesmo sem chaves configuradas.

---

## 🚀 Como Rodar

### Configuração Rápida

#### 1. Backend (Python)
```bash
cd backend
pip install -r requirements.txt

# Copie e configure as variáveis de ambiente (opcional)
cp .env.example .env
# Edite o .env com suas API keys (veja API_SETUP.md)

# Inicie o servidor
uvicorn main:app --reload --port 8000
```
API disponível em `http://localhost:8000` · Docs em `http://localhost:8000/docs`

#### 2. Frontend (Next.js)
```bash
cd frontend
npm install

# Configure o Google Maps (opcional mas recomendado)
cp .env.local.example .env.local
# Edite o .env.local com sua chave do Google Maps

# Inicie o frontend
npm run dev
```
Interface disponível em `http://localhost:3000`

### ✅ Verificar Status das APIs

Acesse: `http://localhost:8000/api/status`

Você verá o status de conexão de cada API integrada.

---

## 🔧 Configuração Detalhada

### Opção 1: Modo Básico (Sem APIs)
O projeto funciona imediatamente sem nenhuma configuração adicional usando modo fallback.

### Opção 2: Modo Completo (Com APIs)
Para habilitar todas as funcionalidades avançadas:

1. **📖 Leia o guia completo:** [API_SETUP.md](./API_SETUP.md)
2. **Configure as APIs que desejar** (todas são opcionais)
3. **Teste a integração** em `/api/status`

**APIs Gratuitas:**
- ✅ IBGE: 100% gratuito (sem cadastro)
- ✅ Google Maps: $200/mês de crédito gratuito
- ✅ Google Speech: 60 min/mês gratuito

**APIs Pagas:**
- 💰 OpenAI: ~$0.50-$2/mês (uso baixo)

---

## 🧮 Como o Score é Calculado

O **Opportunity Score** (0–100) combina 6 fatores com pesos diferentes:

| Fator | Peso | Fonte de Dados |
|---|---|---|
| Concorrência local | 25% | Simulado |
| Perfil demográfico | 20% | IBGE (se configurado) |
| Poder de compra | 20% | IBGE (se configurado) |
| Tendências de consumo | 15% | Simulado |
| Fluxo urbano | 10% | Simulado |
| Viabilidade financeira | 10% | Cálculo local |

---

## 🛠️ Stack Tecnológica

### Backend
- **Python 3.11** - Linguagem base
- **FastAPI** - Framework web moderno
- **OpenAI SDK** - Integração GPT-4
- **Google Cloud Speech** - Transcrição de áudio
- **Requests** - Cliente HTTP para IBGE API
- **NumPy & Pandas** - Processamento de dados

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **@react-google-maps/api** - Google Maps integration
- **Recharts** - Data visualization
- **Axios** - API client
- **Framer Motion** - Animations

---

## 📁 Estrutura do Projeto

```
radar-oportunidades/
├── backend/
│   ├── main.py              # Endpoints FastAPI + Integração APIs
│   ├── ml_engine.py         # Motor de ML + dados simulados
│   ├── openai_service.py    # 🤖 Serviço OpenAI
│   ├── ibge_service.py      # 📊 Serviço IBGE
│   ├── speech_service.py    # 🎙️ Serviço Google Speech
│   ├── models.py            # Schemas Pydantic
│   ├── requirements.txt     # Dependências Python
│   └── .env.example         # Template de configuração
├── frontend/
│   └── src/
│       ├── app/             # Layout e página raiz
│       ├── components/      # Componentes React
│       │   ├── MapComponent.tsx    # 🗺️ Google Maps
│       │   ├── VoiceInput.tsx      # 🎙️ Entrada por voz
│       │   └── ...
│       ├── lib/             # API client
│       └── types/           # Interfaces TypeScript
├── API_SETUP.md             # 📖 Guia de configuração de APIs
└── README.md                # Este arquivo
```

---

## 🗺️ Regiões Cobertas

**São Paulo Capital:**
Vila Madalena · Moema · Pinheiros · Jardins · Vila Olímpia · Centro · Liberdade · Lapa · Santana · Tatuapé · Consolação · Itaquera

**Grande São Paulo & Interior:**
Santo André · Campinas · ABC Paulista

---

## 🎓 Para Desenvolvedores

### Rodar testes (quando disponíveis)
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

### Build para produção
```bash
# Backend
# Deploy no Render, Railway, etc.

# Frontend
cd frontend
npm run build
npm start
```

### Verificar status das APIs
```bash
curl http://localhost:8000/api/status
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Áreas de melhoria:

- [ ] Adicionar mais regiões
- [ ] Integrar mais tipos de negócio
- [ ] Melhorar algoritmo de ML
- [ ] Adicionar autenticação de usuários
- [ ] Implementar histórico de análises
- [ ] Criar testes automatizados
- [ ] Adicionar suporte a outras cidades brasileiras

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais na FECAP.

---

## 🆘 Suporte

- **🐛 Bugs:** Abra uma issue no GitHub
- **📖 Documentação:** Veja [API_SETUP.md](./API_SETUP.md)
- **❓ Dúvidas:** Entre em contato com a equipe

---

## 🎯 Roadmap

- [x] ✅ Integração OpenAI para explicações IA
- [x] ✅ Integração Google Maps para mapas avançados
- [x] ✅ Integração Google Speech-to-Text
- [x] ✅ Integração IBGE para dados reais
- [x] ✅ Modo fallback resiliente
- [ ] 🔄 Autenticação e perfis de usuário
- [ ] 🔄 Histórico de análises
- [ ] 🔄 Exportar relatórios em PDF
- [ ] 🔄 Suporte para mais cidades
- [ ] 🔄 App mobile (React Native)

---

> Feito com ❤️ usando FastAPI, Next.js, OpenAI, Google Cloud e IBGE · Feira Científica Smart Cities 2026 - FECAP
