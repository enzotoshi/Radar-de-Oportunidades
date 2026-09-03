# Radar de Oportunidades

Aplicação educacional para consultar dados públicos de uma localização brasileira e produzir métricas derivadas claramente identificadas.

## Política de dados

A aplicação não usa números fictícios como fatos. Quando uma fonte não responde ou não possui o dado, a interface exibe indisponibilidade. Projeções são rotuladas como simulação e usam hipóteses informadas pelo usuário.

Fontes atuais:

- OpenStreetMap/Overpass: estabelecimentos, infraestrutura e mobilidade mapeados.
- Nominatim: geocodificação explícita de endereços, feita pelo backend.
- IBGE/SIDRA: código oficial do município e PIB municipal.
- WorldPop 100 m via Esri: estimativa populacional de 2020 dentro do raio analisado.
- Google Cloud Speech-to-Text: opcional; sem credenciais, o recurso informa indisponibilidade.

Consulte [METRICAS_REAIS.md](METRICAS_REAIS.md) e [SISTEMA_PONTUACAO.md](SISTEMA_PONTUACAO.md).

## Arquitetura

```
frontend Next.js
  -> cliente HTTP centralizado
backend FastAPI
  -> Nominatim / Overpass / IBGE / WorldPop
```

Chaves privadas nunca são enviadas ao frontend. As consultas Nominatim são serializadas, limitadas e armazenadas em cache no backend.

## Executar localmente

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements_simple.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Acesse:

- Frontend: http://localhost:3000
- API: http://localhost:8000
- OpenAPI: http://localhost:8000/docs

Copie os arquivos `.env.example` somente se precisar alterar URLs, timeouts ou configurar voz.

## Limitações importantes

- OSM é colaborativo; ausência de cadastro não prova ausência no mundo real.
- A população no raio é estimada pelo WorldPop, referência 2020, e não é uma contagem censitária.
- PIB municipal não equivale a renda de bairro.
- Não há fonte integrada para aluguel, preço de imóvel, fluxo de pedestres, custo de abertura, faturamento ou ROI; esses valores não são exibidos.
- O índice de oportunidade é metodologia própria, não indicador oficial nem probabilidade de sucesso.
