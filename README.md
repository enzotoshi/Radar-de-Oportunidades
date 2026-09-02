# 🎯 Radar de Oportunidades - Smart Cities

Dashboard profissional para análise de oportunidades de negócio baseado em dados demográficos, geolocalização e inteligência artificial.

---

## ✨ Características

- 🗺️ **Mapas OpenStreetMap** (100% gratuito, sem limite)
- 🤖 **Análise com IA** (OpenAI - opcional)
- 📊 **Dados demográficos** reais (IBGE)
- 📍 **Geocoding gratuito** (Nominatim)
- 💼 **Dashboard profissional** estilo SaaS
- 📱 **Totalmente responsivo**

---

## 🚀 Início Rápido

### 1. Instalar Dependências (primeira vez)

```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Iniciar Sistema

**Opção A - Automático:**
```bash
# Windows: duplo clique em start.cmd
# Escolha opção 3
```

**Opção B - Manual:**
```bash
# Terminal 1 - Backend
cd backend
python -m uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 3. Acessar

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🔑 Configuração (Opcional)

### APIs Gratuitas (já funcionam):
- ✅ OpenStreetMap - Mapas
- ✅ Nominatim - Geocoding
- ✅ IBGE - Dados demográficos

### OpenAI (opcional - para análises IA):

1. Obtenha chave em: https://platform.openai.com/api-keys
2. Edite `backend/.env`
3. Configure: `OPENAI_API_KEY=sua_chave`

**Custo:** ~R$ 0,05 por análise

---

## 📁 Estrutura

```
├── backend/              # API Python/FastAPI
│   ├── main.py          # Servidor principal
│   ├── .env             # Configuração de APIs
│   └── requirements.txt # Dependências Python
│
├── frontend/            # Dashboard Next.js
│   ├── src/
│   │   ├── app/        # Páginas
│   │   ├── components/ # Componentes React
│   │   │   └── dashboard/  # Dashboard profissional
│   │   ├── data/       # Dados mockados
│   │   └── types/      # Tipos TypeScript
│   ├── .env.local      # Config frontend
│   └── package.json    # Dependências Node
│
├── start.cmd           # Inicia tudo automaticamente
└── LEIA-ME.txt         # Guia rápido
```

---

## 💡 Funcionalidades

### Dashboard:
- 📊 4 cards de indicadores (população, renda, concorrência, demanda)
- 🗺️ Mapa interativo com marcadores coloridos
- 📈 Ranking de melhores oportunidades
- 💬 Justificativa de análise com IA
- 👥 Perfil demográfico da região
- 📊 Gráfico de performance por categoria

### Filtros:
- 📍 Localização (busca de endereços)
- 🏪 Tipo de negócio (8 opções)
- 💰 Orçamento (R$ 10k - R$ 2mi+)
- 💵 Faixa de renda do público

### Mapa:
- 🗺️ Modo Mapa / Satélite
- 🔍 Zoom +/-
- 🎯 Centralizar
- 📍 Marcadores coloridos por score
- 💬 Popup com informações ao clicar

---

## 🛠️ Tecnologias

### Backend:
- Python 3.11+
- FastAPI
- Uvicorn
- OpenAI API (opcional)

### Frontend:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Leaflet.js (mapas)
- Recharts (gráficos)

---

## 💰 Custos

| Serviço | Custo |
|---------|-------|
| OpenStreetMap | R$ 0 (gratuito) |
| Nominatim | R$ 0 (gratuito) |
| IBGE | R$ 0 (gratuito) |
| OpenAI | ~R$ 0,05/análise (opcional) |
| **Total** | **R$ 0/mês** 🎉 |

---

## 🆘 Problemas Comuns

**"pip: command not found"**
→ Instale Python: https://www.python.org/

**"npm: command not found"**  
→ Instale Node.js: https://nodejs.org/

**"Port já em uso"**
→ Feche outros terminais rodando backend/frontend

**"Mapa não carrega"**
→ Aguarde 2-3 segundos (Leaflet carrega via CDN)

---

## 📝 Licença

Este projeto é open source.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

## 📚 Documentação

- `LEIA-ME.txt` - Guia rápido de uso
- `backend/.env.example` - Exemplo de configuração
- `frontend/.env.local.example` - Exemplo de configuração

---

**Desenvolvido para Smart Cities 2024**
