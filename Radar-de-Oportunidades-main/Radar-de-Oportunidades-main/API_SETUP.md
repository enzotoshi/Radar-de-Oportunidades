# 🔌 Guia de Configuração das APIs

Este guia explica como obter e configurar as chaves de API necessárias para o **Radar de Oportunidades Inteligente**.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [OpenAI API](#1-openai-api)
3. [Google Maps API](#2-google-maps-api)
4. [Google Cloud Speech-to-Text](#3-google-cloud-speech-to-text)
5. [IBGE API](#4-ibge-api)
6. [Configuração do Backend](#configuração-do-backend)
7. [Configuração do Frontend](#configuração-do-frontend)
8. [Testando as Integrações](#testando-as-integrações)
9. [Modo Fallback](#modo-fallback)
10. [Solução de Problemas](#solução-de-problemas)

---

## Visão Geral

O projeto integra 4 APIs externas para fornecer funcionalidades avançadas:

| API | Funcionalidade | Custo | Obrigatória? |
|-----|---------------|-------|--------------|
| **OpenAI** | Explicações inteligentes com GPT | Pago por uso | ❌ Não (tem fallback) |
| **Google Maps** | Mapas interativos avançados | Gratuito até limite | ⚠️ Recomendado |
| **Google Speech** | Transcrição de áudio | Gratuito até 60 min/mês | ❌ Não (tem fallback) |
| **IBGE** | Dados demográficos reais | **100% Gratuito** | ❌ Não (tem fallback) |

> ✅ **O projeto funciona completamente sem APIs configuradas!** Todas têm modo fallback automático.

---

## 1. OpenAI API

### 🎯 Para que serve
Gera explicações inteligentes e personalizadas sobre oportunidades de negócio usando GPT-4.

### 💰 Custo
- **Modelo recomendado:** `gpt-4o-mini` (~$0.15 por 1M tokens de entrada)
- **Uso estimado:** ~500 tokens por análise = ~$0.00008 por análise
- **Crédito inicial:** Novas contas ganham $5 de crédito gratuito

### 📝 Como obter

#### Passo 1: Criar conta OpenAI
1. Acesse: https://platform.openai.com/signup
2. Crie uma conta com email ou Google/Microsoft
3. Verifique seu email

#### Passo 2: Adicionar método de pagamento
1. Acesse: https://platform.openai.com/account/billing
2. Clique em "Add payment method"
3. Adicione um cartão de crédito
4. Configure limites de uso para segurança (recomendado: $10/mês)

#### Passo 3: Gerar API Key
1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Dê um nome: `radar-oportunidades`
4. **IMPORTANTE:** Copie e salve a chave imediatamente (só aparece uma vez!)
5. A chave começa com `sk-proj-...`

#### Passo 4: Configurar no projeto
Edite o arquivo `backend/.env`:
```bash
OPENAI_API_KEY=sk-proj-sua_chave_aqui
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7
```

### 🔒 Segurança
- ⚠️ **NUNCA** compartilhe sua API key
- ⚠️ **NUNCA** faça commit da key no Git
- ✅ Use `.env` (já está no `.gitignore`)
- ✅ Configure limites de uso no dashboard da OpenAI
- ✅ Rotacione a key periodicamente

---

## 2. Google Maps API

### 🎯 Para que serve
Exibe mapas interativos com marcadores customizados e informações detalhadas das regiões.

### 💰 Custo
- **Gratuito:** $200 de crédito mensal (~28.000 carregamentos de mapa)
- **Depois do limite:** $7 por 1.000 carregamentos
- **Para este projeto:** Provavelmente sempre gratuito (uso baixo)

### 📝 Como obter

#### Passo 1: Criar conta Google Cloud
1. Acesse: https://console.cloud.google.com
2. Faça login com sua conta Google
3. Aceite os termos de serviço
4. **Importante:** Precisará adicionar um cartão (não será cobrado no free tier)

#### Passo 2: Criar um projeto
1. No topo da página, clique em "Select a project" → "New Project"
2. Nome do projeto: `Radar de Oportunidades`
3. Clique em "Create"
4. Aguarde a criação (leva ~30 segundos)

#### Passo 3: Habilitar APIs necessárias
1. Acesse: https://console.cloud.google.com/apis/library
2. Pesquise e habilite as seguintes APIs (clique em "Enable" em cada uma):
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API** (opcional, para busca por endereço)
   - ✅ **Places API** (opcional, para informações de locais)

#### Passo 4: Criar API Key
1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique em "Create Credentials" → "API key"
3. **IMPORTANTE:** Uma chave será gerada. Copie-a!
4. Clique em "Restrict key" (recomendado para segurança)

#### Passo 5: Restringir a chave (Segurança)
1. Em "Application restrictions":
   - Selecione "HTTP referrers (web sites)"
   - Adicione: `http://localhost:3000/*`
   - Adicione: `https://seu-dominio.com/*` (quando fizer deploy)
2. Em "API restrictions":
   - Selecione "Restrict key"
   - Marque apenas: Maps JavaScript API, Geocoding API, Places API
3. Clique em "Save"

#### Passo 6: Configurar no projeto

**Frontend** - Crie o arquivo `frontend/.env.local`:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_aqui
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 🔒 Segurança
- ✅ Configure restrições de referrer (HTTP referrers)
- ✅ Configure restrições de API
- ✅ Monitore uso no dashboard
- ⚠️ Keys do frontend são públicas (por isso as restrições são importantes!)

---

## 3. Google Cloud Speech-to-Text

### 🎯 Para que serve
Transcreve áudio para texto com alta precisão, permitindo entrada por voz no sistema.

### 💰 Custo
- **Gratuito:** 60 minutos de transcrição por mês
- **Depois do limite:** $0.006 por 15 segundos
- **Para este projeto:** Provavelmente sempre gratuito

### 📝 Como obter

#### Passo 1: Usar o mesmo projeto Google Cloud
Se já criou o projeto para o Google Maps, use o mesmo!

#### Passo 2: Habilitar a API
1. Acesse: https://console.cloud.google.com/apis/library
2. Pesquise por "Cloud Speech-to-Text API"
3. Clique em "Enable"

#### Passo 3: Criar Service Account
1. Acesse: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Clique em "Create Service Account"
3. Nome: `radar-speech-service`
4. Descrição: `Service account para transcrição de áudio`
5. Clique em "Create and Continue"

#### Passo 4: Configurar permissões
1. Em "Grant this service account access to project":
   - Role: `Cloud Speech-to-Text API User`
2. Clique em "Continue"
3. Clique em "Done"

#### Passo 5: Gerar arquivo de credenciais JSON
1. Na lista de service accounts, clique na que você criou
2. Vá para a aba "Keys"
3. Clique em "Add Key" → "Create new key"
4. Selecione "JSON"
5. Clique em "Create"
6. **Um arquivo JSON será baixado automaticamente - guarde-o com segurança!**

#### Passo 6: Configurar no projeto
1. Renomeie o arquivo baixado para `google-credentials.json`
2. Mova para a pasta `backend/`: `backend/google-credentials.json`
3. Edite `backend/.env`:
```bash
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id
```

**IMPORTANTE:** Adicione ao `.gitignore`:
```
backend/google-credentials.json
```

### 🔒 Segurança
- ⚠️ **NUNCA** faça commit do arquivo JSON de credenciais
- ⚠️ Mantenha o arquivo fora do controle de versão
- ✅ Use service accounts ao invés de chaves de usuário
- ✅ Dê apenas as permissões necessárias

---

## 4. IBGE API

### 🎯 Para que serve
Fornece dados demográficos oficiais e atualizados de municípios brasileiros.

### 💰 Custo
**100% GRATUITO - SEM NECESSIDADE DE CADASTRO!** 🎉

### 📝 Como usar

A API do IBGE não requer chave ou autenticação. Está **automaticamente habilitada** no projeto!

#### Configuração (opcional)
Edite `backend/.env` apenas se quiser desabilitar:
```bash
USE_IBGE_DATA=true  # true = usa IBGE, false = usa dados simulados
IBGE_API_BASE_URL=https://servicodados.ibge.gov.br/api/v3
```

### 📚 Documentação oficial
- https://servicodados.ibge.gov.br/api/docs

### ✅ Vantagens
- ✅ Totalmente gratuito
- ✅ Sem necessidade de cadastro
- ✅ Dados oficiais do governo
- ✅ Sempre atualizado

---

## Configuração do Backend

### Arquivo `.env`

1. Copie o arquivo de exemplo:
```bash
cd backend
cp .env.example .env
```

2. Edite o arquivo `.env` com suas chaves:
```bash
# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=sk-proj-sua_chave_openai
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# Google Maps (usado no frontend, não no backend)
GOOGLE_MAPS_API_KEY=sua_chave_google_maps

# Google Cloud Speech-to-Text
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=seu-projeto-id

# IBGE API (não precisa de chave)
IBGE_API_BASE_URL=https://servicodados.ibge.gov.br/api/v3
USE_IBGE_DATA=true

# Configurações gerais
ENABLE_FALLBACK=true
API_TIMEOUT=10
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Execute o backend:
```bash
uvicorn main:app --reload --port 8000
```

---

## Configuração do Frontend

### Arquivo `.env.local`

1. Copie o arquivo de exemplo:
```bash
cd frontend
cp .env.local.example .env.local
```

2. Edite o arquivo `.env.local`:
```bash
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_maps

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Instale as dependências:
```bash
npm install
```

4. Execute o frontend:
```bash
npm run dev
```

---

## Testando as Integrações

### 1. Verificar status das APIs

Acesse no navegador:
```
http://localhost:8000/api/status
```

Resposta esperada:
```json
{
  "apis": {
    "openai": {
      "status": "connected",
      "description": "Gera explicações inteligentes...",
      "fallback": "Explicações baseadas em regras (disponível)"
    },
    "ibge": {
      "status": "connected",
      "description": "Fornece dados demográficos reais...",
      "fallback": "Dados simulados (disponível)"
    },
    "google_speech": {
      "status": "connected",
      "description": "Transcreve áudio para texto...",
      "fallback": "Transcrição simulada (disponível)"
    }
  },
  "overall_status": "operational"
}
```

### 2. Testar análise com OpenAI

Use o frontend em `http://localhost:3000` e faça uma análise de negócio. 
Se o OpenAI estiver conectado, a explicação será mais detalhada e personalizada.

### 3. Testar Google Maps

Abra o frontend. Se a chave estiver correta, você verá:
- ✅ Mapa do Google Maps com estilo dark customizado
- ✅ Círculos coloridos representando regiões
- ✅ InfoWindow ao clicar nas regiões

Se houver erro:
- ❌ Mensagem de erro sobre API key
- ❌ Instruções para configurar

### 4. Testar Speech-to-Text

No frontend, use o botão de microfone para gravar um áudio.
Se estiver funcionando, você verá a transcrição aparecer automaticamente.

### 5. Testar IBGE

Faça uma análise e verifique se os dados demográficos são reais (população, PIB per capita).

---

## Modo Fallback

**Todas as APIs têm fallback automático!** O sistema continua funcionando mesmo sem chaves configuradas.

### Como funciona

```
API disponível? → Usa API real
     ↓ NÃO
API em fallback? → Usa dados/lógica simulados
     ↓ SIM
Sistema continua funcionando! ✅
```

### Indicadores de Fallback

- **OpenAI:** Explicações baseadas em regras (menos personalizadas)
- **Google Maps:** Não tem fallback (mostra instruções de configuração)
- **Speech-to-Text:** Transcrição simulada baseada no tamanho do áudio
- **IBGE:** Dados demográficos estimados e simulados

### Configurar Fallback

Edite `backend/.env`:
```bash
ENABLE_FALLBACK=true   # true = usa fallback, false = retorna erro
```

---

## Solução de Problemas

### ❌ OpenAI: "API key not configured"

**Causa:** Chave não configurada ou inválida.

**Solução:**
1. Verifique se a chave está em `backend/.env`
2. Certifique-se que começa com `sk-proj-`
3. Teste a chave em: https://platform.openai.com/playground
4. Verifique se há créditos disponíveis

### ❌ Google Maps: "Erro ao carregar mapa"

**Causa:** Chave inválida ou APIs não habilitadas.

**Solução:**
1. Verifique se a chave está em `frontend/.env.local`
2. Certifique-se que as APIs estão habilitadas no Google Cloud Console
3. Verifique as restrições de referrer
4. Abra o console do navegador (F12) para ver erros detalhados

### ❌ Google Speech: "Speech client error"

**Causa:** Arquivo de credenciais não encontrado ou inválido.

**Solução:**
1. Verifique se `backend/google-credentials.json` existe
2. Verifique o caminho em `GOOGLE_APPLICATION_CREDENTIALS`
3. Certifique-se que a API está habilitada no Google Cloud Console
4. Teste as credenciais com: `gcloud auth application-default login`

### ❌ IBGE: "Timeout" ou "Connection error"

**Causa:** API do IBGE fora do ar ou timeout de rede.

**Solução:**
1. Verifique sua conexão com a internet
2. Teste a API diretamente: https://servicodados.ibge.gov.br/api/v1/localidades/estados
3. Aumente o timeout em `backend/.env`: `API_TIMEOUT=30`
4. O sistema automaticamente usará fallback se a API falhar

### ⚠️ CORS Error no frontend

**Causa:** Backend não está aceitando requisições do frontend.

**Solução:**
1. Verifique se `FRONTEND_URL` está configurado em `backend/.env`
2. Certifique-se que o backend está rodando na porta correta
3. Verifique se o `NEXT_PUBLIC_API_URL` no frontend aponta para o backend correto

---

## 📊 Resumo de Custos

| API | Custo Mensal Estimado | Observação |
|-----|----------------------|------------|
| OpenAI | ~$0.50 - $2.00 | 1.000 análises/mês com gpt-4o-mini |
| Google Maps | $0 (dentro do free tier) | Até 28.000 carregamentos |
| Google Speech | $0 (dentro do free tier) | Até 60 minutos de áudio |
| IBGE | $0 (sempre gratuito) | Sem limite |
| **TOTAL** | **~$0.50 - $2.00** | Uso típico de desenvolvimento |

---

## 🎓 Recursos Adicionais

### OpenAI
- 📚 Documentação: https://platform.openai.com/docs
- 💡 Playground: https://platform.openai.com/playground
- 💰 Pricing: https://openai.com/pricing

### Google Maps
- 📚 Documentação: https://developers.google.com/maps/documentation
- 💡 Samples: https://github.com/googlemaps/js-samples
- 💰 Pricing: https://mapsplatform.google.com/pricing/

### Google Cloud Speech
- 📚 Documentação: https://cloud.google.com/speech-to-text/docs
- 💡 Quickstart: https://cloud.google.com/speech-to-text/docs/quickstart
- 💰 Pricing: https://cloud.google.com/speech-to-text/pricing

### IBGE
- 📚 Documentação: https://servicodados.ibge.gov.br/api/docs
- 💡 Exemplos: https://servicodados.ibge.gov.br/api/docs/agregados

---

## ✅ Checklist de Configuração

Use este checklist para garantir que tudo está configurado:

### Backend
- [ ] Arquivo `backend/.env` criado
- [ ] OpenAI API key configurada (opcional)
- [ ] Google Speech credentials.json configurado (opcional)
- [ ] Dependências instaladas: `pip install -r requirements.txt`
- [ ] Backend rodando: `uvicorn main:app --reload`
- [ ] Endpoint `/api/status` retornando status das APIs

### Frontend
- [ ] Arquivo `frontend/.env.local` criado
- [ ] Google Maps API key configurada (recomendado)
- [ ] Dependências instaladas: `npm install`
- [ ] Frontend rodando: `npm run dev`
- [ ] Mapa carregando corretamente
- [ ] Requisições ao backend funcionando

### Testes
- [ ] Análise de negócio funcionando
- [ ] Mapa interativo funcionando
- [ ] Entrada por voz funcionando (se configurado)
- [ ] Simulação de cenários funcionando
- [ ] Dados demográficos aparecendo

---

## 🆘 Precisa de Ajuda?

1. **Verifique os logs do backend:** Erros detalhados aparecem no terminal
2. **Verifique o console do navegador:** Pressione F12 no navegador
3. **Teste o endpoint `/api/status`:** Mostra o status de cada API
4. **Use o modo fallback:** Desative APIs problemáticas temporariamente

---

**Feito com ❤️ para a Feira Científica Smart Cities 2026 - FECAP**
