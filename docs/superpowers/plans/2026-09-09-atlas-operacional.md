# Atlas Operacional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir o frontend do Radar de Oportunidades como uma estação cartográfica de decisão, preservando integralmente contratos, dados reais e regras do backend.

**Architecture:** O App Router e o estado de domínio permanecem em `MainApp`, enquanto shell, consulta, evidências, simulação e modo investidor passam a ser unidades focadas. O sistema visual será centralizado em tokens CSS de três camadas; o cliente Axios e os tipos públicos permanecem como fronteira estável com o FastAPI.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS 3, CSS custom properties, Framer Motion, Leaflet 1.9.4, Recharts 2, Axios, Lucide React, Playwright Core e Axe Core.

**Spec:** `docs/superpowers/specs/2026-09-09-atlas-operacional-design.md`

## Global Constraints

- Não alterar endpoints, payloads, fórmulas, cache, banco, CORS ou serviços públicos do backend.
- Preservar Next.js App Router, `output: 'export'`, React 18, Leaflet, Recharts, Axios e Framer Motion.
- Nenhum mock pode ser importado pelo código de produção; fixtures ficam apenas em scripts de teste.
- Somente `NEXT_PUBLIC_API_URL` pode ser exposta no frontend; credenciais continuam no backend.
- Meta de acessibilidade: WCAG 2.1 AA, alvos mínimos de 44 × 44 px, reflow em 320 px e zoom de 200%.
- Todo estado deve ter representação inicial, carregando, sucesso e erro, com `aria-busy` ou live region quando aplicável.
- A interface não usa emojis como iconografia; Lucide fornece os ícones visuais e o texto preserva o significado.
- Movimento usa apenas `transform` e `opacity`, com 100, 180 e 260 ms e fallback para `prefers-reduced-motion`.
- IBM Plex Sans Variable será empacotada localmente, sem CDN.
- Azul e turquesa do logotipo orientam a identidade; estado nunca depende somente de cor.

---

## File Map

### Create

- `frontend/src/styles/tokens.css`: tokens primitivos, semânticos e de componentes.
- `frontend/src/styles/base.css`: reset, tipografia, utilidades acessíveis e preferências do sistema.
- `frontend/src/lib/formatters.ts`: formatação de métricas, datas e nomes de negócio.
- `frontend/src/components/shared/Button.tsx`: botão tipado com variantes e estado ocupado.
- `frontend/src/components/shared/IconButton.tsx`: botão de ícone com nome obrigatório.
- `frontend/src/components/shared/StatusBadge.tsx`: estado textual com ícone e variante semântica.
- `frontend/src/components/shared/InlineAlert.tsx`: feedback de informação, aviso e erro.
- `frontend/src/components/shared/DataKindBadge.tsx`: natureza observado/estimado/calculado.
- `frontend/src/components/app-shell/AppHeader.tsx`: marca, navegação e contexto.
- `frontend/src/components/app-shell/PrimaryNavigation.tsx`: navegação responsiva entre áreas.
- `frontend/src/components/analysis/AddressCombobox.tsx`: busca explícita e seleção por teclado.
- `frontend/src/components/analysis/OpportunityQuery.tsx`: campos, voz e ação de análise.
- `frontend/src/components/analysis/MetricSignal.tsx`: métrica com valor e proveniência.
- `frontend/src/components/analysis/AnalysisInsights.tsx`: resultado priorizado e próxima ação.
- `frontend/src/components/analysis/ProvenanceDialog.tsx`: fontes e metodologia.
- `frontend/src/components/simulation/ScenarioControls.tsx`: controles de hipótese.
- `frontend/src/components/simulation/ProjectionChart.tsx`: gráfico, tooltip e tabela.
- `frontend/src/components/investor/ScoreOverview.tsx`: pontuação geral e confirmação.
- `frontend/src/components/investor/EvidenceBreakdown.tsx`: componentes, feedback e dicas.
- `frontend/scripts/check-ui-architecture.cjs`: verificações estáticas do sistema visual.

### Modify

- `frontend/package.json`: fonte local e dependências de auditoria; scripts de teste.
- `frontend/package-lock.json`: lockfile correspondente.
- `frontend/tailwind.config.js`: aliases dos tokens e remoção de valores legados.
- `frontend/src/app/layout.tsx`: fonte local, metadata nacional e imports de estilos.
- `frontend/src/app/globals.css`: layout do Atlas operacional e estilos dos domínios.
- `frontend/src/components/MainApp.tsx`: novo shell, navegação e contexto compartilhado.
- `frontend/src/components/MapAnalysis.tsx`: orquestração da consulta, mapa e evidências.
- `frontend/src/components/AnalysisReport.tsx`: removido ao final quando consumidores migrarem.
- `frontend/src/components/ScenarioSimulation.tsx`: Laboratório de cenários.
- `frontend/src/components/Gamification.tsx`: Quadro do investidor.
- `frontend/src/components/DetailsSheet.tsx`: substituído por diálogo compartilhado.
- `frontend/src/components/AnalysisRequired.tsx`: novo estado vazio compartilhado.
- `frontend/src/components/MapComponent.tsx`: tokens de marcador.
- `frontend/src/components/OpenStreetMap.tsx`: estado de mapa e carregamento estável.
- `frontend/src/components/VoiceInput.tsx`: interface visual e IDs de negócio válidos.
- `frontend/src/lib/motion.ts`: escala e variantes de movimento.
- `frontend/scripts/review-ui.cjs`: seletores, Axe e estabilidade de tiles.
- `frontend/DESIGN.md`: documentação do sistema final e comandos de validação.

### Preserve Without Contract Changes

- `frontend/src/lib/api.ts`
- `frontend/src/types/index.ts`
- `backend/main.py`
- `backend/models.py`
- `backend/public_data_service.py`
- `backend/speech_service.py`

---

### Task 1: Freeze contracts and establish the design-system foundation

**Files:**
- Create: `frontend/scripts/check-ui-architecture.cjs`
- Create: `frontend/src/styles/tokens.css`
- Create: `frontend/src/styles/base.css`
- Create: `frontend/src/lib/formatters.ts`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/app/layout.tsx`

**Interfaces:**
- Consumes: `MetricDetail`, `DataKind` and the current App Router layout.
- Produces: `formatMetric(metric: MetricDetail): string`, `formatCollectedAt(value: string): string`, global CSS tokens, locally bundled IBM Plex Sans and `npm run test:architecture`.

- [ ] **Step 1: Add the failing architecture check**

Create `frontend/scripts/check-ui-architecture.cjs`:

```js
const assert = require('node:assert/strict')
const fs = require('node:fs')

const tokens = fs.readFileSync('src/styles/tokens.css', 'utf8')
const layout = fs.readFileSync('src/app/layout.tsx', 'utf8')
const globals = fs.readFileSync('src/app/globals.css', 'utf8')

for (const token of [
  '--primitive-teal-700',
  '--color-structure',
  '--color-action',
  '--text-body',
  '--control-height',
  '--motion-fast',
]) assert.match(tokens, new RegExp(token), `Missing token ${token}`)

assert.match(layout, /@fontsource-variable\/ibm-plex-sans/)
assert.doesNotMatch(globals, /font-size:\s*\.5rem/)
assert.doesNotMatch(globals, /font-size:\s*\.5625rem/)
console.log('UI architecture checks passed')
```

- [ ] **Step 2: Register the test script and run it red**

Add to `frontend/package.json` scripts:

```json
"test:architecture": "node scripts/check-ui-architecture.cjs",
"test:ui": "node scripts/review-ui.cjs"
```

Run: `npm run test:architecture`

Expected: FAIL because `src/styles/tokens.css` does not exist.

- [ ] **Step 3: Install deterministic local assets and audit tooling**

Run:

```powershell
npm install @fontsource-variable/ibm-plex-sans
npm install -D playwright-core @axe-core/playwright
```

Expected: `package.json` and `package-lock.json` record the three packages without downloading a bundled browser.

- [ ] **Step 4: Create the three-layer token system**

Create `frontend/src/styles/tokens.css` with this structure:

```css
:root {
  --primitive-petrol-950: #0b2930;
  --primitive-petrol-900: #10363d;
  --primitive-teal-700: #087f78;
  --primitive-teal-800: #066861;
  --primitive-blue-700: #176b9a;
  --primitive-mist-50: #f4f8f7;
  --primitive-white: #ffffff;
  --primitive-ink-900: #102d32;
  --primitive-ink-600: #50666a;
  --primitive-amber-700: #a75f00;
  --primitive-red-700: #b43b32;

  --color-structure: var(--primitive-petrol-950);
  --color-structure-subtle: var(--primitive-petrol-900);
  --color-action: var(--primitive-teal-700);
  --color-action-hover: var(--primitive-teal-800);
  --color-data: var(--primitive-blue-700);
  --color-canvas: var(--primitive-mist-50);
  --color-surface: var(--primitive-white);
  --color-ink: var(--primitive-ink-900);
  --color-ink-muted: var(--primitive-ink-600);
  --color-warning: var(--primitive-amber-700);
  --color-danger: var(--primitive-red-700);

  --text-display: clamp(2.5rem, 4vw, 3.25rem);
  --text-h1: clamp(1.875rem, 3vw, 2.375rem);
  --text-h2: clamp(1.4375rem, 2vw, 1.75rem);
  --text-h3: 1.125rem;
  --text-body-lg: 1.0625rem;
  --text-body: 1rem;
  --text-body-sm: .875rem;
  --text-caption: .75rem;

  --space-1: .25rem;
  --space-2: .5rem;
  --space-3: .75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --radius-control: .5rem;
  --radius-panel: .75rem;
  --radius-pill: 999px;
  --control-height: 2.75rem;
  --motion-instant: 100ms;
  --motion-fast: 180ms;
  --motion-base: 260ms;
}
```

- [ ] **Step 5: Create base styles and connect the font**

Create `frontend/src/styles/base.css` with semantic element rules, visible focus, `.sr-only`, reduced-motion, forced-colors and 44 px interactive targets. Import it and `tokens.css` from `layout.tsx` after importing:

```tsx
import '@fontsource-variable/ibm-plex-sans'
import '@/styles/tokens.css'
import '@/styles/base.css'
```

Update metadata description to “Análise territorial de oportunidades de negócio no Brasil com dados públicos identificados.”

- [ ] **Step 6: Centralize data formatting**

Create `frontend/src/lib/formatters.ts`:

```ts
import type { MetricDetail } from '@/types'

export function formatMetric(metric: MetricDetail): string {
  if (metric.value === null || metric.value === undefined || metric.value === '') return 'Dado indisponível'
  if (metric.unit === 'BRL' && typeof metric.value === 'number') {
    return metric.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }
  const value = typeof metric.value === 'number'
    ? metric.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    : metric.value
  return metric.unit ? `${value} ${metric.unit}` : String(value)
}

export function formatCollectedAt(value: string): string {
  return new Date(value).toLocaleString('pt-BR')
}
```

- [ ] **Step 7: Run foundation checks**

Run:

```powershell
npm run test:architecture
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 8: Commit the foundation**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/tailwind.config.js frontend/src/app/layout.tsx frontend/src/styles frontend/src/lib/formatters.ts frontend/scripts/check-ui-architecture.cjs
git commit -m "feat: establish atlas design system"
```

---

### Task 2: Build shared controls and the new application shell

**Files:**
- Create: `frontend/src/components/shared/Button.tsx`
- Create: `frontend/src/components/shared/IconButton.tsx`
- Create: `frontend/src/components/shared/StatusBadge.tsx`
- Create: `frontend/src/components/shared/InlineAlert.tsx`
- Create: `frontend/src/components/shared/DataKindBadge.tsx`
- Create: `frontend/src/components/app-shell/AppHeader.tsx`
- Create: `frontend/src/components/app-shell/PrimaryNavigation.tsx`
- Modify: `frontend/src/components/MainApp.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/scripts/review-ui.cjs`

**Interfaces:**
- Consumes: `ActiveTab`, `AnalysisResult`, `useReducedMotion`, existing navigation callbacks.
- Produces: `Button`, `IconButton`, `StatusBadge`, `InlineAlert`, `DataKindBadge`, `AppHeader` and `.primary-navigation [aria-current="page"]` selectors.

- [ ] **Step 1: Change the browser contract before the shell**

Update `review-ui.cjs` to assert:

```js
await page.getByRole('banner').waitFor()
assert.equal(await page.getByRole('navigation', { name: 'Áreas do Radar' }).count(), 1)
assert.equal(await page.locator('.app-header .primary-navigation').count(), 1)
assert.equal(await page.locator('.app-header').evaluate(el => el.getBoundingClientRect().height <= 84), true)
```

Run: `npm run test:ui`

Expected: FAIL because the existing navigation is a fixed lateral rail.

- [ ] **Step 2: Create typed shared controls**

Implement `Button` with props extending `ButtonHTMLAttributes<HTMLButtonElement>`, variants `primary | secondary | quiet`, sizes `default | compact`, `busy?: boolean`, `aria-busy={busy}` and disabled state. Implement `IconButton` with required `label: string` and `aria-label={label}`.

`InlineAlert` receives:

```ts
interface InlineAlertProps {
  tone: 'info' | 'warning' | 'error'
  children: React.ReactNode
  role?: 'status' | 'alert'
}
```

`DataKindBadge` maps `real`, `estimated` and `calculated` to visible labels and distinct Lucide icons.

- [ ] **Step 3: Create semantic navigation**

Implement `PrimaryNavigation`:

```ts
interface PrimaryNavigationProps {
  activeTab: ActiveTab
  onNavigate: (tab: ActiveTab, focusContent?: boolean) => void
}
```

Render three buttons inside `<nav aria-label="Áreas do Radar">`; set `aria-current="page"` only on the active button. Preserve labels “Explorar”, “Simular” and “Modo investidor”.

- [ ] **Step 4: Create the compact header**

Implement `AppHeader` with the existing logo, `PrimaryNavigation`, the selected municipality/address, and `StatusBadge` with “Análise disponível” or “Aguardando análise”. The logo remains a button that navigates to `map`.

- [ ] **Step 5: Replace the shell without changing state ownership**

In `MainApp.tsx`, keep `activeTab`, `visited`, `selectedRegion`, `selectedBusiness`, `analysisResult` and the existing `navigate` function. Replace only the header/footer JSX with `AppHeader`; keep the three domain components and their props unchanged.

- [ ] **Step 6: Implement desktop and mobile shell layout**

In `globals.css`, define `.app-header` as sticky top header, remove left padding from `.app-shell`, reserve bottom navigation height below 700 px and include `padding-bottom: env(safe-area-inset-bottom)` in the mobile nav. Do not leave `.rail-context`, `.nav-section-label` or `--rail-width` rules in use.

- [ ] **Step 7: Verify shell behavior**

Run:

```powershell
npm run test:architecture
npm run test:ui
npm run build
```

Expected: shell assertions pass, all three views remain navigable, state-retention assertions stay green.

- [ ] **Step 8: Commit the shell**

```powershell
git add frontend/src/components/shared frontend/src/components/app-shell frontend/src/components/MainApp.tsx frontend/src/app/globals.css frontend/scripts/review-ui.cjs
git commit -m "feat: rebuild radar application shell"
```

---

### Task 3: Extract the address flow and rebuild the query workspace

**Files:**
- Create: `frontend/src/components/analysis/AddressCombobox.tsx`
- Create: `frontend/src/components/analysis/OpportunityQuery.tsx`
- Modify: `frontend/src/components/MapAnalysis.tsx`
- Modify: `frontend/src/components/VoiceInput.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/scripts/review-ui.cjs`

**Interfaces:**
- Consumes: `searchAddress`, `getBusinesses`, `analyzeOpportunity`, `AddressSuggestion`, `Business` and current state setters.
- Produces: `AddressCombobox` with explicit search and keyboard selection, `OpportunityQuery` with the unchanged analysis payload, and `.atlas-query` selectors.

- [ ] **Step 1: Add failing flow assertions**

Add these expectations before changing components:

```js
await page.getByRole('region', { name: 'Configurar análise' }).waitFor()
await page.getByRole('combobox', { name: 'Localização' }).fill('Avenida Paulista')
await page.getByRole('button', { name: 'Buscar endereço' }).click()
await page.getByRole('option', { name: /Avenida Paulista/ }).waitFor()
assert.equal(await page.locator('.atlas-query').count(), 1)
```

Run: `npm run test:ui`

Expected: FAIL on the new region or button name.

- [ ] **Step 2: Implement `AddressCombobox`**

Use this public interface:

```ts
interface AddressComboboxProps {
  value: string
  selected: AddressSuggestion | null
  onValueChange: (value: string) => void
  onSelect: (location: AddressSuggestion) => void
  onError: (message: string | null) => void
}
```

Move search versioning, results, loading and active-option state from `MapAnalysis`. Preserve explicit Enter search, arrows, Escape, `role="combobox"`, `aria-activedescendant`, `role="listbox"` and verified-result copy. Name the search action “Buscar endereço”.

- [ ] **Step 3: Implement `OpportunityQuery`**

Use this interface:

```ts
interface OpportunityQueryProps {
  active: boolean
  address: string
  selectedLocation: AddressSuggestion | null
  selectedBusiness: string
  budget: number
  analyzing: boolean
  error: string | null
  onAddressChange: (value: string) => void
  onLocationSelect: (value: AddressSuggestion) => void
  onBusinessChange: (value: string) => void
  onBudgetChange: (value: number) => void
  onAnalyze: () => void
  onError: (message: string | null) => void
}
```

Load the business catalogue inside this component. Render sector-aware Lucide icon beside the select label, but render option text as `business.name` only; do not use `business.icon`.

- [ ] **Step 4: Preserve voice entity compatibility**

Correct the client-side entity IDs in `VoiceInput.tsx`: use `farmacia` instead of `farmácia` and `brecho` instead of `brechó`. Keep the current browser SpeechRecognition lifecycle and stop recognition when `active` becomes false.

- [ ] **Step 5: Reduce `MapAnalysis` to orchestration**

Keep `selectedLocation`, `budget`, `analyzing`, `error`, request versioning and API calls in `MapAnalysis`. Replace field JSX with `OpportunityQuery`. The POST body must remain:

```ts
{
  address: selectedLocation.display_name,
  business_type: selectedBusiness,
  lat: selectedLocation.lat,
  lng: selectedLocation.lng,
  budget,
}
```

- [ ] **Step 6: Style the query panel**

Create `.atlas-query` as a 20rem desktop column with stable footer action, 16 px input text on mobile, visible labels, 44 px controls and a suggestion popover above map overlays. Use sentence case and remove numbered step labels.

- [ ] **Step 7: Verify the exact request contract**

Run: `npm run test:ui`

Expected: address keyboard and click flows pass; captured `/api/analyze-with-ai` body equals the existing contract fixture.

- [ ] **Step 8: Commit query reconstruction**

```powershell
git add frontend/src/components/analysis/AddressCombobox.tsx frontend/src/components/analysis/OpportunityQuery.tsx frontend/src/components/MapAnalysis.tsx frontend/src/components/VoiceInput.tsx frontend/src/app/globals.css frontend/scripts/review-ui.cjs
git commit -m "feat: rebuild opportunity query workflow"
```

---

### Task 4: Rebuild the map workspace and prioritized analysis insights

**Files:**
- Create: `frontend/src/components/analysis/MetricSignal.tsx`
- Create: `frontend/src/components/analysis/AnalysisInsights.tsx`
- Create: `frontend/src/components/analysis/ProvenanceDialog.tsx`
- Modify: `frontend/src/components/MapAnalysis.tsx`
- Modify: `frontend/src/components/MapComponent.tsx`
- Modify: `frontend/src/components/OpenStreetMap.tsx`
- Modify: `frontend/src/components/DetailsSheet.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/scripts/review-ui.cjs`

**Interfaces:**
- Consumes: `AnalysisResult`, `MetricDetail`, `formatMetric`, current Leaflet marker inputs.
- Produces: `AnalysisInsights`, `MetricSignal`, `ProvenanceDialog`, `.atlas-map` and `.analysis-insights` regions.

- [ ] **Step 1: Add failing result hierarchy assertions**

After fulfilling the analysis fixture, assert:

```js
await page.getByRole('complementary', { name: 'Evidências da oportunidade' }).waitFor()
assert.equal(await page.locator('[data-metric-kind="real"]').count(), 2)
assert.equal(await page.getByText('Sinais que formam o índice').count(), 1)
assert.equal(await page.getByText('Contexto do território').count(), 1)
```

Run: `npm run test:ui`

Expected: FAIL because the current result is a flat metric grid.

- [ ] **Step 2: Implement reusable metric presentation**

`MetricSignal` receives:

```ts
interface MetricSignalProps {
  metricKey: string
  metric: MetricDetail
  emphasis?: 'primary' | 'context'
}
```

Render label, `formatMetric(metric)`, `DataKindBadge`, source and reference. Set `data-metric-kind={metric.kind}`. Do not hide null values.

- [ ] **Step 3: Implement provenance disclosure**

Move sources, formula, collection time and “não é indicador oficial” copy into `ProvenanceDialog`. Reuse the native `<dialog>` behavior from `DetailsSheet`, retaining Escape, backdrop click, focus containment and restoration.

- [ ] **Step 4: Implement prioritized insights**

`AnalysisInsights` receives `result`, `onClear` and `onGoToInvestor`. Render in order: score/classification, recommendation, methodology components, contextual metrics, warnings, provenance and next action. Determine component metrics by keys `competitors`, `competition_density`, `infrastructure`, `mobility`; all remaining keys go into context without changing values.

- [ ] **Step 5: Recompose the analysis workspace**

In `MapAnalysis`, render three siblings inside `.atlas-workspace`: `OpportunityQuery`, `<section className="atlas-map">`, and `AnalysisInsights` or an initial evidence guide. At 1024–1439 px, expose evidence as a toggled drawer with a labeled button; at 1440 px show all three columns.

- [ ] **Step 6: Stabilize the Leaflet lifecycle check**

Initialize the map directly from the `center` and `zoom` props:

```ts
const map = L.map(mapRef.current).setView(center, zoom)
```

In `review-ui.cjs`, change tile readiness to accept at least one visible, complete tile with `naturalWidth > 0`. Continue checking marker popup, zoom and overlay stacking.

- [ ] **Step 7: Tokenize markers and overlays**

Pass marker semantic type instead of arbitrary color where feasible, mapping analyzed location to `--color-action` and businesses to `--color-data`. Preserve marker titles and popup text. Keep the OSM attribution visible.

- [ ] **Step 8: Verify analysis states**

Run:

```powershell
npm run test:architecture
npm run test:ui
npm run build
```

Expected: empty, loading, result, clear, drawer, dialog and 503 error flows pass with no console errors.

- [ ] **Step 9: Commit map and insights**

```powershell
git add frontend/src/components/analysis frontend/src/components/MapAnalysis.tsx frontend/src/components/MapComponent.tsx frontend/src/components/OpenStreetMap.tsx frontend/src/components/DetailsSheet.tsx frontend/src/app/globals.css frontend/scripts/review-ui.cjs
git commit -m "feat: create cartographic analysis workspace"
```

---

### Task 5: Rebuild the Laboratory of Scenarios

**Files:**
- Create: `frontend/src/components/simulation/ScenarioControls.tsx`
- Create: `frontend/src/components/simulation/ProjectionChart.tsx`
- Modify: `frontend/src/components/ScenarioSimulation.tsx`
- Modify: `frontend/src/components/AnalysisRequired.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/scripts/review-ui.cjs`

**Interfaces:**
- Consumes: `AnalysisResult`, `SimulationResult`, `simulateScenario` and shared controls.
- Produces: `ScenarioControls`, `ProjectionChart`, `.scenario-lab` and unchanged `/api/simulate` request body.

- [ ] **Step 1: Add failing semantic and chart assertions**

Add:

```js
await page.getByRole('heading', { name: 'Laboratório de cenários' }).waitFor()
await page.getByRole('region', { name: 'Hipóteses do cenário' }).waitFor()
await page.getByRole('region', { name: 'Trajetória projetada' }).waitFor()
assert.equal(await page.getByRole('slider').count(), 3)
```

Run: `npm run test:ui`

Expected: FAIL on the new heading and named regions.

- [ ] **Step 2: Extract controls**

`ScenarioControls` receives the three numeric values, their setters, `loading`, `error` and `onSimulate`. Preserve ranges `-20..50`, `-30..80` and `0..20`. Each output remains associated to its slider with `htmlFor` and `aria-valuetext`.

- [ ] **Step 3: Extract the chart and equivalent table**

`ProjectionChart` receives:

```ts
interface ProjectionChartProps {
  result: SimulationResult
  currentYear: number
}
```

Build `chartData` from the observed value plus five projections. Keep `accessibilityLayer`, tooltip, axes, reference line and visible expandable table. Add direct “Observado” and “Projetado” legend text so meaning is not color-only.

- [ ] **Step 4: Recompose the laboratory**

Keep request versioning and API call in `ScenarioSimulation`. Render a territorial context strip, `ScenarioControls`, summary values, `ProjectionChart` and methodology. Use `InlineAlert` for failure. The payload fields and invalidation effect remain unchanged.

- [ ] **Step 5: Rebuild the prerequisite state**

Update `AnalysisRequired` to accept `areaLabel: string` and render a compact cartographic empty state with the same “Ir para o mapa” action. Do not render a full second map below 768 px; use the logo’s radar mark and explanatory copy instead.

- [ ] **Step 6: Verify simulation behavior**

Run: `npm run test:ui`

Expected: sliders respond to keyboard, request body remains exact, six table rows render, result persists after navigation and no overflow occurs.

- [ ] **Step 7: Commit scenario laboratory**

```powershell
git add frontend/src/components/simulation frontend/src/components/ScenarioSimulation.tsx frontend/src/components/AnalysisRequired.tsx frontend/src/app/globals.css frontend/scripts/review-ui.cjs
git commit -m "feat: rebuild scenario laboratory"
```

---

### Task 6: Rebuild the Investor Evidence Board

**Files:**
- Create: `frontend/src/components/investor/ScoreOverview.tsx`
- Create: `frontend/src/components/investor/EvidenceBreakdown.tsx`
- Modify: `frontend/src/components/Gamification.tsx`
- Modify: `frontend/src/lib/motion.ts`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/scripts/review-ui.cjs`

**Interfaces:**
- Consumes: `AnalysisResult`, `GameResult`, `calculateGameScore`, `useReducedMotion`.
- Produces: `ScoreOverview`, `EvidenceBreakdown`, radar-sweep completion variant and unchanged `/api/gamification/score` request.

- [ ] **Step 1: Add failing evidence-board assertions**

Add:

```js
await page.getByRole('heading', { name: 'Quadro do investidor' }).waitFor()
await page.getByRole('button', { name: 'Calcular pontuação educacional' }).click()
await page.getByRole('region', { name: 'Composição da pontuação' }).waitFor()
assert.equal(await page.getByRole('meter').count(), 3)
assert.equal(await page.locator('.confetti-piece').count(), 0)
```

Run: `npm run test:ui`

Expected: FAIL because the current title and confetti behavior differ.

- [ ] **Step 2: Implement score overview**

`ScoreOverview` receives `result: GameResult` and `reducedMotion: boolean`. Render total, maximum, classification and “Pontuação educacional; não representa retorno”. Use a CSS conic meter plus the numeric text. The optional radar sweep runs once through `transform` and `opacity` and is absent under reduced motion.

- [ ] **Step 3: Implement evidence breakdown**

Render three `role="meter"` rows with textual labels, values and maxima. Use action teal, data blue and warning amber, plus different Lucide icons. Render feedback, tips, methodology dialog and collection time after the meters.

- [ ] **Step 4: Recompose the investor flow**

Keep `phase`, `gameResult`, `loading`, `error`, request versioning and reset behavior in `Gamification`. Remove `Confetti`, `CONFETTI_COLORS`, timers and arbitrary component colors. Keep the prerequisite state and current analysis context.

- [ ] **Step 5: Define named motion variants**

Update `motion.ts`:

```ts
export const motionDuration = { instant: 0.1, fast: 0.18, base: 0.26 }
export const panelTransition = { type: 'spring' as const, stiffness: 420, damping: 42, mass: 1 }
export const viewFade = { duration: motionDuration.fast }
export const resultReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}
```

All consumers use these exports instead of one-off durations.

- [ ] **Step 6: Verify investor behavior**

Run: `npm run test:ui`

Expected: exact score request, three meters, reset, state retention, no confetti and no result sweep with reduced motion.

- [ ] **Step 7: Commit investor board**

```powershell
git add frontend/src/components/investor frontend/src/components/Gamification.tsx frontend/src/lib/motion.ts frontend/src/app/globals.css frontend/scripts/review-ui.cjs
git commit -m "feat: rebuild investor evidence board"
```

---

### Task 7: Complete responsive behavior and accessibility remediation

**Files:**
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/components/app-shell/PrimaryNavigation.tsx`
- Modify: `frontend/src/components/analysis/AddressCombobox.tsx`
- Modify: `frontend/src/components/analysis/AnalysisInsights.tsx`
- Modify: `frontend/src/components/DetailsSheet.tsx`
- Modify: `frontend/scripts/review-ui.cjs`
- Modify: `frontend/scripts/check-ui-architecture.cjs`

**Interfaces:**
- Consumes: all implemented UI selectors and the existing Playwright fixtures.
- Produces: Axe-clean covered states, keyboard-complete navigation and responsive screenshots at five widths.

- [ ] **Step 1: Add Axe to the browser test before remediation**

Require Axe and analyze initial, result, simulation and investor states:

```js
const AxeBuilder = require('@axe-core/playwright').default

async function assertNoSeriousAxeViolations(page, state) {
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter(item => ['critical', 'serious'].includes(item.impact))
  assert.deepEqual(blocking, [], `${state}: ${blocking.map(item => item.id).join(', ')}`)
}
```

Replace `browser.newPage(...)` with a context because Axe requires an isolated browser context:

```js
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
const page = await context.newPage()
// Close context before browser in the finalizer.
await context.close()
```

Run: `npm run test:ui`

Expected: FAIL until mobile button naming and contrast findings are removed.

- [ ] **Step 2: Implement full navigation and combobox keyboard contracts**

Ensure mobile controls retain accessible text through `aria-label`, even when visible labels are hidden. In the combobox, announce result count in a polite live region and set `aria-invalid` plus `aria-describedby` when location selection fails.

- [ ] **Step 3: Verify dialog focus and semantics**

Keep native `<dialog>`, ensure the close button has `aria-label="Fechar detalhes"`, heading is referenced by `aria-labelledby`, Escape closes and focus returns to the trigger. Hide decorative Lucide icons with `aria-hidden="true"`.

- [ ] **Step 4: Implement content-driven responsive rules**

Use these layout transitions:

```css
.atlas-workspace { grid-template-columns: 20rem minmax(0, 1fr) 24rem; }
@media (max-width: 1439px) {
  .atlas-workspace { grid-template-columns: 20rem minmax(0, 1fr); }
  .analysis-insights { position: fixed; inset: var(--header-height) 0 0 auto; width: min(25rem, 100%); }
}
@media (max-width: 1023px) {
  .atlas-workspace { grid-template-columns: minmax(0, 1fr); }
  .atlas-query { order: 1; }
  .atlas-map { order: 2; min-height: 48svh; }
}
@media (max-width: 767px) {
  .analysis-insights { position: static; width: auto; order: 3; }
}
```

Adjust exact breakpoints only when screenshots prove content collision; retain the behavioral transitions above.

- [ ] **Step 5: Test five widths and 200% text**

For 1440, 1024, 768, 375 and 320 px, visit each area and assert:

```js
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
```

At 375 px set root font size to 200%, repeat all three areas, and verify the focused element is not covered by the mobile navigation.

- [ ] **Step 6: Test system preferences**

Emulate `reducedMotion: 'reduce'`, forced colors where supported, and increased contrast via CSS media emulation or class-level assertions. Verify no decorative sweep appears and every primary action retains a visible boundary.

- [ ] **Step 7: Run the accessibility gate**

Run:

```powershell
npm run test:architecture
npm run test:ui
npm run build
```

Expected: zero critical or serious Axe violations in covered states, no overflow, no console errors and build exit 0.

- [ ] **Step 8: Commit responsive and accessibility work**

```powershell
git add frontend/src frontend/scripts/review-ui.cjs frontend/scripts/check-ui-architecture.cjs
git commit -m "fix: complete responsive and accessible interactions"
```

---

### Task 8: Remove superseded presentation code and run end-to-end verification

**Files:**
- Remove if unused: `frontend/src/components/AnalysisReport.tsx`
- Remove if unused: `frontend/src/components/DetailsSheet.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/DESIGN.md`
- Modify: `README.md`
- Test: `frontend/scripts/review-ui.cjs`
- Test: `backend/test_data_policy.py`

**Interfaces:**
- Consumes: completed frontend and unchanged backend API.
- Produces: clean dependency graph, current documentation and final evidence bundle.

- [ ] **Step 1: Prove legacy components are unused**

Run:

```powershell
rg -n "AnalysisReport|DetailsSheet|rail-context|confetti-piece|step-number" frontend/src
```

Expected: no imports of `AnalysisReport` or `DetailsSheet`; no active legacy CSS selectors. Delete only files proven unused.

- [ ] **Step 2: Remove obsolete CSS and validate tokens**

Delete selectors that only support the old side rail, old report grid, old confetti and old numbered fields. Extend `check-ui-architecture.cjs`:

```js
for (const legacy of ['rail-context', 'confetti-piece', 'step-number']) {
  assert.doesNotMatch(globals, new RegExp(`\\.${legacy}\\b`), `Legacy selector ${legacy}`)
}
```

Run: `npm run test:architecture`

Expected: PASS.

- [ ] **Step 3: Update design and execution documentation**

Document in `frontend/DESIGN.md`: Atlas concept, token layers, typography roles, component ownership, responsive modes, motion rules, accessibility target and test commands. Update `README.md` only if commands change; retain separate backend and frontend startup instructions.

- [ ] **Step 4: Run backend tests and live health checks**

Run:

```powershell
cd backend
.\.venv\Scripts\python.exe -m unittest -v
Invoke-RestMethod http://localhost:8000/ | ConvertTo-Json -Depth 5
Invoke-RestMethod http://localhost:8000/api/businesses | Select-Object -ExpandProperty businesses | Measure-Object
Invoke-RestMethod 'http://localhost:8000/api/geocode?q=Avenida%20Paulista%2C%20Sao%20Paulo' | ConvertTo-Json -Depth 5
```

Expected: six unit tests pass, health reports `online` and `real-only`, catalogue contains 20 items and geocoding returns at least one Nominatim result.

- [ ] **Step 5: Run the complete frontend gate**

Run:

```powershell
cd frontend
npm ci
npm run test:architecture
npm run build
```

Start the built frontend and backend, then run:

```powershell
npm run test:ui
```

Expected: build exit 0, browser report `passed: true`, all three request bodies match contracts, five widths pass, Axe has no critical/serious findings and console errors are empty.

- [ ] **Step 6: Inspect accepted screenshots**

Open desktop and mobile captures for empty, loading, success and error states. Check map dominance, panel collision, cropped content, target spacing, type hierarchy, dialog placement, fixed navigation and visual distinction between observed, estimated and calculated data.

- [ ] **Step 7: Review the complete diff**

Run:

```powershell
git diff --check
git status --short
git diff --stat HEAD~7..HEAD
```

Expected: no whitespace errors, no secrets or backend changes, and only intentional frontend/documentation files.

- [ ] **Step 8: Commit cleanup and documentation**

```powershell
git add frontend README.md
git commit -m "docs: finalize atlas operational frontend"
```
