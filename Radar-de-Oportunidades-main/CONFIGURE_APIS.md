# 🚀 Guia Rápido de Configuração das APIs

**Arquivos criados:**
- ✅ `backend/.env`
- ✅ `frontend/.env.local`

## 📋 Checklist de Configuração

### 1️⃣ Obter Chave da OpenAI (GPT)

1. Acesse: **https://platform.openai.com/api-keys**
2. Faça login ou crie uma conta
3. Clique em **"Create new secret key"**
4. Dê um nome: `radar-oportunidades`
5. **Copie a chave** (ela começa com `sk-proj-...`)
6. Cole no arquivo `backend/.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-sua_chave_copiada_aqui
   ```

**💰 Custo:** ~$0.50 por mês de uso típico (usa modelo gpt-4o-mini)

---

### 2️⃣ Obter Chave do Google Maps

1. Acesse: **https://console.cloud.google.com**
2. Faça login com sua conta Google
3. Crie um novo projeto:
   - Clique no seletor de projetos (topo da página)
   - Clique em **"New Project"**
   - Nome: `Radar de Oportunidades`
   - Clique em **"Create"**

4. Habilite as APIs necessárias:
   - Acesse: **https://console.cloud.google.com/apis/library**
   - Pesquise e habilite (clique em "Enable"):
     - ✅ **Maps JavaScript API**
     - ✅ **Geocoding API**
     - ✅ **Places API**

5. Crie a API Key:
   - Acesse: **https://console.cloud.google.com/apis/credentials**
   - Clique em **"Create Credentials"** → **"API key"**
   - **Copie a chave gerada**

6. Configure a chave em DOIS lugares:

   **Backend** - Arquivo `backend/.env`:
   ```bash
   GOOGLE_MAPS_API_KEY=sua_chave_copiada_aqui
   ```

   **Frontend** - Arquivo `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_copiada_aqui
   ```

   ⚠️ **IMPORTANTE:** Use a MESMA chave nos dois arquivos!

**💰 Custo:** Gratuito até 28.000 carregamentos/mês

---

### 3️⃣ Restringir a Chave do Google Maps (Segurança)

1. No Google Cloud Console, vá em **Credentials**
2. Clique na chave que você criou
3. Em **"Application restrictions"**:
   - Selecione **"HTTP referrers (web sites)"**
   - Adicione: `http://localhost:3000/*`
   - Adicione: `http://localhost:8000/*`
   - (Quando fizer deploy, adicione seu domínio)

4. Em **"API restrictions"**:
   - Selecione **"Restrict key"**
   - Marque apenas:
     - Maps JavaScript API
     - Geocoding API
     - Places API

5. Clique em **"Save"**

---

## 🎯 Testar a Configuração

### Passo 1: Instalar dependências do Backend

```bash
cd backend
pip install -r requirements.txt
```

### Passo 2: Executar o Backend

```bash
cd backend
uvicorn main:app --reload
```

✅ Deve mostrar: `Application startup complete`

### Passo 3: Testar as APIs

Abra no navegador: **http://localhost:8000/api/status**

Você deve ver algo como:
```json
{
  "apis": {
    "openai": {
      "status": "connected"
    },
    "google_maps": {
      "status": "connected"
    }
  }
}
```

### Passo 4: Instalar dependências do Frontend

Abra outro terminal:

```bash
cd frontend
npm install
```

### Passo 5: Executar o Frontend

```bash
cd frontend
npm run dev
```

✅ Deve mostrar: `Ready on http://localhost:3000`

### Passo 6: Testar no Navegador

Abra: **http://localhost:3000**

✅ Você deve ver:
- Mapa do Google Maps carregado
- Marcadores de regiões
- Ao fazer uma análise, explicação gerada pelo GPT

---

## ❌ Problemas Comuns

### Erro: "OpenAI API key não configurada"

**Solução:**
- Verifique se você colocou a chave no `backend/.env`
- Certifique-se que a chave começa com `sk-proj-`
- Reinicie o backend: `Ctrl+C` e execute `uvicorn main:app --reload` novamente

### Erro: "Erro ao carregar Google Maps"

**Solução:**
- Verifique se você colocou a chave no `frontend/.env.local`
- Certifique-se que habilitou as 3 APIs no Google Cloud Console
- Reinicie o frontend: `Ctrl+C` e execute `npm run dev` novamente

### Erro: "CORS Error"

**Solução:**
- Verifique se o backend está rodando na porta 8000
- Verifique se `FRONTEND_URL=http://localhost:3000` no `backend/.env`

---

## 🎉 Pronto!

Se tudo estiver funcionando, você verá:

✅ Backend rodando em: http://localhost:8000  
✅ Frontend rodando em: http://localhost:3000  
✅ Mapa interativo com dados reais  
✅ Explicações inteligentes geradas por IA  

---

## 📚 Documentação Completa

Para instruções detalhadas sobre cada API, custos, e configurações avançadas, consulte:

**API_SETUP.md** - Guia completo de configuração de APIs

---

## 🆘 Precisa de Ajuda?

1. Verifique os logs no terminal do backend e frontend
2. Teste o endpoint: http://localhost:8000/api/status
3. Abra o console do navegador (F12) para ver erros
4. Consulte o API_SETUP.md para troubleshooting detalhado

---

**Feito com ❤️ para a Feira Científica Smart Cities 2026 - FECAP**
