# 🚀 Guia de Deploy - Radar de Oportunidades

Este guia explica como fazer o deploy completo do projeto (backend + frontend).

---

## 📋 Pré-requisitos

- Conta no GitHub (você já tem ✅)
- Conta no Render (gratuita) — https://render.com

---

## 🔧 Parte 1: Deploy do Backend (Render)

### 1. Criar conta no Render

Acesse **https://render.com** e crie uma conta (pode usar o login do GitHub).

### 2. Criar novo Web Service

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório do GitHub: **enzotoshi/Radar-de-Oportunidades**
3. Configure:
   - **Name:** `radar-oportunidades-api` (ou outro nome)
   - **Region:** Oregon (Free)
   - **Branch:** `main`
   - **Root Directory:** deixe vazio
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

### 3. Adicionar variável de ambiente

Na seção **"Environment"**, adicione:

```
FRONTEND_URL = https://enzotoshi.github.io
```

### 4. Deploy

Clique em **"Create Web Service"**. O Render vai:
- Clonar o repositório
- Instalar as dependências
- Iniciar o servidor

**Aguarde 3-5 minutos** até aparecer "Live" (bolinha verde).

### 5. Copiar a URL do backend

Quando o deploy terminar, copie a URL que aparece no topo da página. Será algo como:

```
https://radar-oportunidades-api.onrender.com
```

⚠️ **IMPORTANTE:** Guarde essa URL, você vai precisar dela no próximo passo.

---

## 🌐 Parte 2: Conectar o Frontend com o Backend

### 1. Atualizar o workflow do GitHub Actions

No seu computador, abra o arquivo:

```
.github/workflows/deploy.yml
```

Procure a linha 35:

```yaml
NEXT_PUBLIC_API_URL: https://seu-backend.onrender.com
```

**Substitua** pela URL que você copiou no passo anterior:

```yaml
NEXT_PUBLIC_API_URL: https://radar-oportunidades-api.onrender.com
```

### 2. Fazer commit e push

No terminal:

```powershell
cd "C:\Users\25011991\Downloads\Radar-de-Oportunidades-main\Radar-de-Oportunidades-main"
git add .github/workflows/deploy.yml
git commit -m "feat: conectar frontend com backend no Render"
git push
```

### 3. Aguardar o GitHub Actions

1. Acesse **https://github.com/enzotoshi/Radar-de-Oportunidades/actions**
2. Aguarde o workflow terminar (✅ verde)
3. Acesse o site: **https://enzotoshi.github.io/Radar-de-Oportunidades/**

---

## ✅ Teste de Funcionamento

Se tudo funcionou:

1. O site deve carregar sem erros
2. Ao fazer uma análise, os dados devem aparecer (não vai dar erro de conexão)
3. O mapa deve renderizar corretamente

---

## 🐛 Problemas Comuns

### Backend não inicia no Render

**Erro:** `ModuleNotFoundError: No module named 'fastapi'`

**Solução:** Verifique se o arquivo `backend/requirements.txt` existe e está correto.

---

### CORS Error no navegador

**Erro:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solução:** No Render, adicione a variável de ambiente `FRONTEND_URL` com o valor correto.

---

### Frontend não conecta com o backend

**Sintoma:** Erro "Network Error" ou "timeout" ao fazer análise

**Solução:**
1. Verifique se o backend está "Live" (verde) no Render
2. Confirme que a URL no `deploy.yml` está correta
3. Teste a API diretamente: `https://sua-api.onrender.com/` (deve retornar JSON com `"status": "online"`)

---

## 📊 Monitoramento

### Verificar logs do backend

1. Acesse o dashboard do Render
2. Clique no seu serviço
3. Vá em **"Logs"** para ver erros em tempo real

### Verificar deploy do frontend

1. Acesse **https://github.com/enzotoshi/Radar-de-Oportunidades/actions**
2. Clique no último workflow
3. Veja os logs de cada step

---

## 💰 Custos

- **Render Free Tier:** O backend pode "dormir" após 15 minutos de inatividade. A primeira requisição depois disso demora ~30s para "acordar".
- **GitHub Pages:** Totalmente gratuito.

---

## 🔄 Atualizações Futuras

Sempre que você fizer mudanças:

1. **Backend:** Faça commit e push — o Render faz deploy automático
2. **Frontend:** Faça commit e push — o GitHub Actions faz deploy automático

Ambos estão configurados para CI/CD (deploy contínuo).

---

## 📞 Suporte

Se tiver dúvidas ou erros, me manda:
- Logs do Render (aba "Logs")
- Logs do GitHub Actions
- Mensagem de erro que aparece no navegador (Console do DevTools)
