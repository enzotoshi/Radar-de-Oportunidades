# Radar de Oportunidades — Atlas operacional

Data: 2026-09-09
Status: aprovado para planejamento
Escopo: reconstrução do frontend sem alteração de contratos ou regras do backend

## 1. Objetivo

Reconstruir o Radar de Oportunidades como uma estação cartográfica de apoio à decisão. A interface deve tornar evidente, nesta ordem: qual território está sendo analisado, qual oportunidade está em foco, quais sinais sustentam a leitura, quais limitações existem e qual ação vem a seguir.

A mudança é visual e estrutural. Os dados continuam reais, as projeções continuam identificadas como hipóteses e nenhuma métrica financeira é inventada. O frontend preserva todas as operações, payloads, estados e integrações atuais.

## 2. Público e contexto

O produto atende estudantes, empreendedores e pessoas em fase inicial de avaliação de um negócio no Brasil. O contexto principal é desktop ou notebook para exploração analítica, com suporte completo a tablet e celular para consulta e revisão.

A personalidade visual é:

- investigativa;
- confiável;
- cartográfica;
- direta;
- responsável com incerteza.

O produto não deve parecer um painel administrativo genérico, uma landing page ou uma ferramenta que promete prever sucesso comercial.

## 3. Diagnóstico que orienta o redesign

A implementação atual já separa frontend e backend e preserva estado entre áreas, mas apresenta problemas de sistema visual e hierarquia:

- navegação lateral permanente ocupa espaço sem apoiar a tarefa principal;
- mapa, formulário e resultado disputam atenção;
- 23 tamanhos tipográficos e dezenas de cores diretas criam drift;
- rótulos em caixa alta e texto de 8–10 px reduzem legibilidade;
- métricas importantes e auxiliares recebem peso visual semelhante;
- o mobile gera páginas longas e a navegação fixa interfere no conteúdo;
- emojis do catálogo aparecem como iconografia;
- a animação de confete não reforça a leitura dos dados;
- há contraste insuficiente nos números das etapas;
- no mobile, o botão do painel pode perder o nome acessível.

## 4. Direção visual

### 4.1 Conceito

“Atlas operacional” combina linguagem cartográfica com uma superfície de trabalho clara. O mapa é o instrumento central; painéis existem para configurar a consulta e interpretar evidências, não para formar uma grade de cards decorativos.

A assinatura visual será uma linha de varredura de radar usada com extrema parcimônia: no estado inicial do mapa, na confirmação de uma análise concluída e no destaque do índice. Ela nunca será um loop constante nem bloqueará leitura.

### 4.2 Paleta-base

Os valores finais devem ser validados por contraste durante a implementação.

| Papel | Token semântico | Valor inicial |
|---|---|---:|
| Estrutura profunda | `--color-structure` | `#0B2930` |
| Ação primária | `--color-action` | `#087F78` |
| Dados cartográficos | `--color-data` | `#176B9A` |
| Superfície principal | `--color-canvas` | `#F4F8F7` |
| Superfície elevada | `--color-surface` | `#FFFFFF` |
| Texto principal | `--color-ink` | `#102D32` |
| Texto secundário | `--color-ink-muted` | `#50666A` |
| Atenção | `--color-warning` | `#A75F00` |
| Erro | `--color-danger` | `#B43B32` |

Azul e turquesa vêm do logotipo. Verde só representa condição favorável; âmbar representa hipótese ou atenção; vermelho representa erro. Estado nunca depende somente de cor.

### 4.3 Tipografia

Uma única família, IBM Plex Sans Variable, será incorporada localmente para evitar dependência de CDN. Números usarão variantes tabulares da mesma família.

Papéis semânticos:

- `display`: 40–52 px fluido, apenas para a leitura principal de uma área;
- `heading-1`: 30–38 px;
- `heading-2`: 23–28 px;
- `heading-3`: 18–20 px;
- `body-lg`: 17–18 px;
- `body`: 16 px;
- `body-sm`: 14 px;
- `caption`: 12–13 px, nunca abaixo de 12 px para informação útil;
- `data-lg`: 48–72 px, numérico tabular.

Títulos usam `text-wrap: balance`; textos corridos ficam limitados a 65–75 caracteres. Caixa alta é reservada a abreviações genuínas, não a rótulos recorrentes.

### 4.4 Espaço, bordas e elevação

Escala de espaço baseada em 4 px: 4, 8, 12, 16, 24, 32, 48 e 64. Componentes usam aliases semânticos, não valores avulsos.

Raios têm três papéis: 8 px para controles, 12 px para painéis e 999 px apenas para pills. Bordas separam regiões estruturais. Sombras aparecem somente em painéis que flutuam sobre o mapa ou em diálogos.

### 4.5 Movimento

Escala:

- imediato: 100 ms;
- rápido: 180 ms;
- base: 260 ms;
- contextual: mola criticamente amortecida para painéis.

Somente `transform` e `opacity` são animados. Entradas orientam, saídas são mais rápidas e feedback confirma ações. `prefers-reduced-motion` remove deslocamento e mantém, quando necessário, uma transição curta de opacidade.

## 5. Arquitetura do frontend

O App Router, a exportação estática e o cliente HTTP atual serão preservados. A reorganização fica dentro de `frontend/src`:

```text
src/
  app/
    globals.css
    layout.tsx
    page.tsx
  components/
    app-shell/
      AppHeader.tsx
      PrimaryNavigation.tsx
      ContextSummary.tsx
    analysis/
      AnalysisWorkspace.tsx
      OpportunityQuery.tsx
      AddressCombobox.tsx
      AnalysisInsights.tsx
      MetricSignal.tsx
      ProvenanceDialog.tsx
    map/
      MapCanvas.tsx
      MapOverlay.tsx
    simulation/
      ScenarioLab.tsx
      ScenarioControls.tsx
      ProjectionChart.tsx
    investor/
      InvestorBoard.tsx
      ScoreOverview.tsx
      EvidenceBreakdown.tsx
    shared/
      Button.tsx
      IconButton.tsx
      StatusBadge.tsx
      EmptyState.tsx
      InlineAlert.tsx
      LoadingState.tsx
      DetailsDialog.tsx
  hooks/
    useReducedMotion.ts
  lib/
    api.ts
    motion.ts
    formatters.ts
  styles/
    tokens.css
    components.css
  types/
    index.ts
```

A estrutura pode ser ajustada durante implementação quando um arquivo pequeno não justificar uma pasta, mas as fronteiras permanecem: apresentação compartilhada, domínio da análise, mapa, simulação, investidor e acesso à API.

## 6. Estrutura das áreas

### 6.1 Shell e navegação

Desktop:

```text
┌ logo + Radar ── Explorar | Simular | Investidor ── território/status ┐
├───────────────────────────────────────────────────────────────────────┤
│ conteúdo da área ativa                                                │
└───────────────────────────────────────────────────────────────────────┘
```

O cabeçalho é compacto e persistente. A área ativa usa `aria-current="page"`. Em telas estreitas, a navegação vira uma barra inferior com safe-area e espaço reservado no layout, sem cobrir botões ou conteúdo.

### 6.2 Explorar

Desktop amplo:

```text
┌ Consulta 320 px ┬──────────── mapa dominante ────────────┬ Evidências 380 px ┐
│ endereço        │ localização, concorrentes e raio       │ índice + sinais   │
│ negócio         │ overlays mínimos e controles nativos  │ métricas + fontes │
│ orçamento       │                                        │ próxima ação      │
│ voz + ação      │                                        │                   │
└─────────────────┴────────────────────────────────────────┴───────────────────┘
```

Antes da análise, o painel de evidências é reduzido a uma orientação curta. Depois da análise, ele surge sem remover o formulário ou recriar o mapa. O usuário pode recolher consulta ou evidências para ampliar o mapa.

O fluxo de localização continua explícito: digitar, buscar, selecionar resultado verificado e então analisar. A busca não vira autocomplete automático, preservando a política do Nominatim.

No mobile, a ordem é: cabeçalho, consulta, mapa com altura aproximada de 48 svh e folha de evidências em fluxo normal. Nenhuma área depende de drag; abrir e fechar painéis tem botão equivalente.

### 6.3 Resultado territorial

O resultado prioriza interpretação:

1. índice e classificação;
2. recomendação do sistema;
3. três componentes que formam o índice;
4. métricas contextuais;
5. limitações;
6. fontes e metodologia;
7. ação para modo investidor.

Cada métrica mostra valor, unidade, natureza do dado e fonte. As naturezas “observado”, “estimado” e “calculado” usam texto e ícone além de cor. Valores indisponíveis permanecem explícitos.

### 6.4 Laboratório de cenários

O nome visual da área será “Laboratório de cenários”, mantendo o rótulo de navegação “Simular”. O layout terá controles de hipótese em uma coluna e leitura projetada em uma região maior.

O gráfico de área continua adequado à série temporal. Ele mantém tooltip, linha de referência e tabela de valores. Observado e projetado serão diferenciados por rótulo e estilo de linha, não só por cor. A interface repete que projeção não é previsão.

### 6.5 Quadro do investidor

O modo investidor vira um quadro de evidências. A pontuação geral permanece, mas é acompanhada imediatamente pelos três componentes e por uma conclusão textual. O feedback, metodologia, coleta e dicas continuam presentes.

O confete será substituído por uma confirmação breve de varredura quando o cálculo termina. Não há celebração automática de pontuação alta, pois o índice não representa sucesso financeiro.

## 7. Fluxo de dados e contratos preservados

```text
Interface
  ├─ GET /api/businesses ─────────────── catálogo
  ├─ GET /api/geocode?q=... ─────────── seleção verificada
  ├─ POST /api/analyze-with-ai ──────── análise territorial
  ├─ POST /api/simulate ─────────────── projeção hipotética
  ├─ POST /api/gamification/score ───── pontuação educacional
  └─ navegador / POST /api/voice ────── entrada por voz
```

`api.ts`, os tipos públicos e os payloads existentes são a fronteira de compatibilidade. Não haverá mock em código de produção. Fixtures continuam exclusivas dos testes de navegador.

Respostas antigas não podem substituir consultas novas. Ao mudar localização, negócio ou análise-base, resultados dependentes e requisições em voo continuam sendo invalidados.

## 8. Estados

Cada operação terá os quatro estados explícitos:

- inicial: orientação e próxima ação;
- carregando: estrutura estável, `aria-busy` e status anunciado;
- sucesso: confirmação contextual sem roubar foco;
- erro: mensagem junto à ação, causa útil e forma de tentar novamente.

Carregamentos longos de fontes públicas devem explicar o que está sendo consultado. O mapa reserva espaço desde o início para evitar mudança de layout. Falha de tile não apaga dados já obtidos.

## 9. Acessibilidade

Meta: WCAG 2.1 AA, com práticas relevantes da 2.2.

- contraste mínimo de 4,5:1 para texto e 3:1 para componentes;
- controles com alvo mínimo de 44 × 44 px;
- foco visível e não encoberto pela navegação fixa;
- cabeçalhos em ordem lógica e um `h1` por área;
- labels visíveis nos campos;
- combobox com nome, estado, lista e item ativo anunciados;
- abas implementadas como navegação ou padrão completo de tabs, sem semântica híbrida;
- diálogos com nome, foco inicial, Escape e retorno ao disparador;
- gráficos acompanhados por resumo e tabela;
- mapa com descrição textual equivalente das informações relevantes;
- estados anunciados em live region sem mudança inesperada de foco;
- ícones decorativos escondidos de tecnologia assistiva;
- ausência de informação transmitida apenas por cor;
- suporte a zoom de 200%, reflow em 320 px, contraste aumentado, forced colors e movimento reduzido.

Os dois defeitos confirmados pelo Axe — contraste dos números de etapa e nome do botão mobile do painel — são critérios de regressão obrigatórios.

## 10. Responsividade

Breakpoints são definidos pelo conteúdo:

- 1440 px ou mais: consulta, mapa e evidências simultâneos;
- 1024–1439 px: consulta fixa, mapa dominante e evidências em drawer;
- 768–1023 px: painéis empilhados ou alternáveis, mapa preservado;
- até 767 px: fluxo vertical, navegação inferior segura e folha de evidências;
- 320 px: nenhum overflow horizontal e nenhum controle truncado.

Componentes de dados usam container queries quando sua adaptação depende mais do painel do que da viewport.

## 11. Componentes e responsabilidades

- `AppHeader`: marca, navegação e contexto territorial.
- `OpportunityQuery`: coordena os campos e a ação, sem conhecer a renderização dos resultados.
- `AddressCombobox`: busca explícita, teclado e seleção verificada.
- `AnalysisInsights`: ordena índice, recomendação, componentes, métricas e alertas.
- `MetricSignal`: formata valor e proveniência com variante semântica.
- `MapCanvas`: ciclo de vida do Leaflet e marcadores.
- `MapOverlay`: legenda, território e nota de cobertura.
- `ScenarioControls`: hipóteses e validação visual.
- `ProjectionChart`: gráfico, tooltip e tabela equivalente.
- `InvestorBoard`: fases de introdução e resultado.
- `DetailsDialog`: disclosure progressivo com foco correto.
- componentes compartilhados: variantes, estados e tokens únicos para controles recorrentes.

## 12. Segurança e backend

Nenhuma chave ou credencial entra no bundle. Somente `NEXT_PUBLIC_API_URL` permanece pública. Google Speech e integrações de dados continuam no backend.

Não há alteração planejada no backend, banco, fórmulas, cache, CORS, serviços externos ou contratos. Uma mudança de backend só será aceita se a verificação revelar incompatibilidade objetiva, usando o menor patch possível.

## 13. Estratégia incremental

1. congelar contratos atuais com testes;
2. criar tokens, tipografia e primitivas compartilhadas;
3. reconstruir shell e navegação;
4. extrair o combobox e reconstruir a área Explorar;
5. reconstruir o resultado e sua proveniência;
6. reconstruir o Laboratório de cenários;
7. reconstruir o Quadro do investidor;
8. adaptar tablet e mobile;
9. executar auditoria visual, teclado e Axe;
10. validar build, backend e integrações.

Cada etapa mantém o projeto compilável. Não haverá troca de biblioteca estrutural nem migração de backend.

## 14. Critérios de aceitação

### Funcionais

- os mesmos endpoints e payloads são usados;
- busca, seleção, análise, simulação, pontuação, voz, mapa, modais e navegação funcionam;
- estado é preservado entre áreas;
- dados reais permanecem visíveis e mocks não entram em produção;
- respostas obsoletas não alteram a interface;
- fontes, metodologia, limitações e indisponibilidade continuam acessíveis.

### Visuais e de experiência

- a navegação lateral antiga deixa de definir o layout;
- mapa é a maior região da área Explorar em desktop;
- consulta e evidências têm hierarquia distinta;
- azul e turquesa do logotipo orientam o sistema sem gradiente decorativo;
- a tipografia usa papéis semânticos e não valores avulsos;
- interface não usa emojis como ícones;
- movimento comunica abertura, transição ou conclusão;
- estados vazios e de erro indicam uma ação possível.

### Acessibilidade e responsividade

- Axe sem violações críticas ou sérias nos fluxos cobertos;
- navegação principal, combobox, sliders, diálogos e ações operáveis por teclado;
- foco visível e restaurado corretamente;
- nenhuma informação depende apenas de cor;
- sem overflow em 320, 375, 768, 1024 e 1440 px;
- conteúdo funcional em zoom de 200%;
- `prefers-reduced-motion` e forced colors respeitados.

### Engenharia

- `npm run build` conclui com sucesso;
- testes do backend continuam passando;
- nenhum import quebrado ou erro de console;
- teste de navegador cobre estados vazio, sucesso, erro e carregamento;
- chamadas reais mínimas confirmam health check, catálogo e geocodificação;
- o teste de mapa considera somente tiles visíveis e carregados, evitando falha por requisições antigas canceladas durante a mudança inicial de zoom.

## 15. Fora de escopo

- autenticação nova;
- ranking automático de regiões;
- comparação entre várias análises persistidas;
- banco de dados ou histórico persistente;
- novas métricas financeiras;
- troca do Leaflet, Recharts, Next.js ou FastAPI;
- tema escuro completo, salvo se surgir como consequência trivial da arquitetura de tokens;
- alterações nas fórmulas do índice, projeção ou pontuação educacional.
