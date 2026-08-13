# ⚡ Guia Rápido de Início

Comece a usar o **Radar de Oportunidades Inteligente** em 5 minutos!

## 🎯 Escolha seu Caminho

### 🟢 Iniciante - Modo Básico (0 configuração)
Rode o projeto imediatamente sem configurar nenhuma API.

### 🔵 Intermediário - Com Google Maps
Adicione apenas o Google Maps para mapas interativos melhores.

### 🟣 Avançado - Modo Completo
Configure todas as APIs para experiência completa com IA.

---

## 🟢 Modo Básico (5 minutos)

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- npm ou yarn

### Passo 1: Clone o repositório
```bash
git clone https://github.com/seu-usuario/radar-oportunidades.git
cd radar-oportunidades
```

### Passo 2: Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Passo 3: Frontend (em outro terminal)
```bash
cd frontend
npm install
npm run dev
```

### Passo 4: Acesse
Abra http://localhost:3000 no navegador

**✅ Pronto!** O sistema está funcionando em modo fallback.

---

## 🔵 Modo Intermediário (10 minutos)

Siga os passos do Modo Básico, depois:

### Passo Extra: Configurar Google Maps

1. **Obter chave:**
   - Acesse: https://console.cloud.google.com
   - Crie um projeto
   - Habilite "Maps JavaScript API"
   - Crie uma API key em "Credentials"

2. **Configurar:**
```bash
cd frontend
cp .env.local.example .env.local
```

3. **Editar `.env.local`:**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. **Reiniciar frontend:**
```bash
npm run dev
```

**✅ Agora você tem mapas Google Maps interativos!**

---

## 🟣 Modo Avançado (30 minutos)

Para experiência completa com IA, siga o **[Guia Completo de APIs](./API_SETUP.md)**.

Configure:
- ✅ Google Maps (mapas avançados)
- ✅ OpenAI (explicações com IA)
- ✅ Google Speech (transcrição precisa)
- ✅ IBGE (dados reais - já funciona sem configuração!)

---

## 🧪 Testando

### 1. Backend está funcionando?
Acesse: http://localhost:8000

Você deve ver:
```json
{
  "status": "online",
  "service": "Radar de Oportunidades Inteligente",
  "version": "2.0.0",
  "apis": { ... }
}
```

### 2. Frontend está funcionando?
Acesse: http://localhost:3000

Você deve ver a interface do Radar de Oportunidades.

### 3. APIs estão conectadas?
Acesse: http://localhost:8000/api/status

Veja o status de cada API integrada.

---

## 📊 Usando o Sistema

### Fazer uma Análise
1. Selecione uma região no mapa
2. Escolha um tipo de negócio
3. Digite o orçamento
4. Clique em "Analisar Oportunidade"

### Usar Entrada por Voz
1. Clique no botão de microfone 🎙️
2. Fale algo como: "Cafeteria em Pinheiros com 100 mil reais"
3. O formulário será preenchido automaticamente

### Simular Cenários
1. Após fazer uma análise
2. Vá para a aba "Simulação"
3. Ajuste os parâmetros (população, renda, concorrência)
4. Veja a projeção de 5 anos

### Modo Investidor (Gamificação)
1. Vá para a aba "Modo Investidor"
2. Escolha região, negócio e orçamento
3. Veja sua pontuação e ranking
4. Receba dicas para melhorar

---

## 🔧 Comandos Úteis

### Backend
```bash
# Rodar servidor
uvicorn main:app --reload --port 8000

# Ver docs da API
# Acesse: http://localhost:8000/docs

# Verificar status das APIs
curl http://localhost:8000/api/status
```

### Frontend
```bash
# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar build de produção
npm start

# Verificar erros de lint
npm run lint
```

---

## ❓ Problemas Comuns

### "Port 8000 already in use"
Outro processo está usando a porta 8000.
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <numero_do_pid> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### "Module not found"
Dependências não instaladas.
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Mapa não carrega
Google Maps API não configurada ou inválida.
- Verifique se a chave está em `frontend/.env.local`
- Veja o console do navegador (F12) para erros
- Consulte [API_SETUP.md](./API_SETUP.md)

### CORS Error
Backend e frontend não estão se comunicando.
- Certifique-se que o backend está rodando em `http://localhost:8000`
- Verifique `NEXT_PUBLIC_API_URL` no frontend
- Veja `FRONTEND_URL` no backend

---

## 📚 Próximos Passos

1. **✅ Projeto funcionando?**
   - Experimente fazer algumas análises
   - Teste a simulação de cenários
   - Jogue o modo investidor

2. **🔧 Quer melhorar?**
   - Configure o Google Maps: [API_SETUP.md](./API_SETUP.md)
   - Adicione OpenAI para explicações com IA
   - Configure Speech-to-Text para entrada por voz

3. **🚀 Pronto para produção?**
   - Leia [DEPLOY.md](./DEPLOY.md) para deploy
   - Configure variáveis de ambiente de produção
   - Use build de produção do frontend

---

## 🆘 Precisa de Ajuda?

- **📖 Documentação completa:** [README.md](./README.md)
- **🔌 Configurar APIs:** [API_SETUP.md](./API_SETUP.md)
- **🚀 Deploy:** [DEPLOY.md](./DEPLOY.md)
- **🐛 Bugs:** Abra uma issue no GitHub

---

**Boa sorte! 🎉**
