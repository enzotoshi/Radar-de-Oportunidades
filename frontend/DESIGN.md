# Atlas operacional — sistema de interface

O frontend do Radar de Oportunidades funciona como uma estação cartográfica de decisão. A interface mantém o mapa como evidência espacial, a consulta como entrada controlada e a leitura de sinais como apoio à decisão. Não há dados de demonstração no código de produção.

## Princípios

- Hierarquia orientada à tarefa: configurar, observar, interpretar e decidir.
- Proveniência visível: observado, estimado e calculado têm texto, ícone e cor próprios.
- Transparência: dado ausente permanece “Dado indisponível”; projeção e pontuação educacional não são apresentadas como previsão.
- Interação acessível: WCAG 2.1 AA, foco visível, controles de pelo menos 44 px, reflow em 320 px e uso completo por teclado.
- Movimento funcional: apenas opacity/transform nos tempos de 100, 180 e 260 ms, com `prefers-reduced-motion`.

## Tokens e tipografia

`src/styles/tokens.css` concentra três camadas: primitivas da identidade, papéis semânticos e medidas de componentes. Petróleo estrutura a aplicação, turquesa identifica ação, azul representa dados e âmbar/vermelho comunicam atenção e erro. IBM Plex Sans Variable é empacotada localmente.

`src/styles/base.css` define reset, semântica global, foco, leitor de tela, redução de movimento e forced colors. `src/app/globals.css` contém a composição responsiva dos domínios e seus estados.

## Componentes e responsabilidades

- `app-shell`: cabeçalho compacto e navegação responsiva entre Explorar, Simular e Modo investidor.
- `shared`: botões, botão de ícone, alertas, status e natureza dos dados.
- `analysis`: combobox de endereço, formulário da consulta, métricas, evidências e proveniência.
- `simulation`: controles de hipótese e gráfico com tabela equivalente.
- `investor`: visão geral e decomposição da pontuação.
- `MainApp.tsx`: estado de domínio compartilhado e retenção das áreas visitadas.
- `MapAnalysis.tsx`, `ScenarioSimulation.tsx` e `Gamification.tsx`: orquestração de cada fluxo e proteção contra respostas obsoletas.
- `src/lib/api.ts` e `src/types/index.ts`: fronteira estável com o FastAPI, sem alterações de contrato.

## Modos responsivos

- 1440 px ou mais: consulta, mapa e evidências em três colunas.
- 1024–1439 px: consulta e mapa; evidências em painel lateral controlado.
- 768–1023 px: consulta e mapa empilhados, com campos em grade.
- Até 767 px: fluxo vertical, mapa com 48svh, evidências no documento e navegação inferior com safe area.

## Validação

```powershell
npm run test:architecture
npm run build
npm run test:ui
```

`test:ui` usa contratos determinísticos exclusivamente no teste, valida os três payloads, teclado, diálogos, estados inicial/sucesso/erro, 15 combinações responsivas, zoom textual de 200%, redução de movimento e Axe. Capturas e relatório ficam em `artifacts/atlas-operacional`.

O backend, as fontes externas, a lógica de pontuação e o formato de exportação estática do Next.js permanecem inalterados.
