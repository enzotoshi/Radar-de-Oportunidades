# Frontend: design and verification

Reference: the complete Apple Design skill supplied in `Downloads/SKILL.md`.

## Presentation

- Keep the Radar identity and logo. A dark navigation rail and light work surface give the product distinct structural regions; deep green actions remain legible on white.
- Use system typography, rem-based sizing, visible keyboard focus and 44px minimum primary targets.
- Give the map the primary workspace, with a collapsible inspector to its right. Query and result modes share that inspector without unmounting form state. The analysis action remains outside the scrollable fields.
- Reserve translucency for map overlays, mobile navigation and sheet headers. Map tiles have their own stacking context so they cannot obscure labels or controls.
- Center the simulation on its projected value and area chart, with assumptions in a dedicated inspector. Present investor results as a score ring with the three weighted components and evidence alongside it.
- Use native modal dialogs for progressively disclosed sources and methodology, with focus containment, Escape handling, focus restoration and symmetric spring entry/exit.
- Native Leaflet gestures and native range inputs retain direct manipulation. Framer Motion provides critically damped navigation springs; large view changes use short opacity transitions.
- Observe reduced motion dynamically; provide solid materials for reduced transparency and stronger boundaries for increased contrast.

## Ownership

- `src/app/globals.css`: shared tokens, materials, control states and responsive layouts.
- `src/lib/motion.ts`: spring and fade settings.
- `src/lib/useReducedMotion.ts`: live operating-system preference subscription.
- `MainApp.tsx`: navigation and visited-view lifetime. Switching views preserves forms and results; microphone capture ends when the map view becomes inactive.
- `MapAnalysis.tsx`: accessible address selection, existing analysis form and full map workspace; stale requests cannot replace a newer selection.
- `AnalysisReport.tsx`: score, metrics, interpretation, warnings and the source/methodology sheet.
- `AnalysisRequired.tsx`: contextual map and actionable empty state shared by simulation and investor views.
- `DetailsSheet.tsx`: accessible native dialog with motion from the same spatial origin on entry and exit.
- `ScenarioSimulation.tsx`: native sliders, chart and equivalent tabular values. A new analysis invalidates the prior projection, including in-flight responses.
- `Gamification.tsx`: existing evaluation, score components, feedback and retry. A new analysis invalidates an in-flight evaluation.
- `OpenStreetMap.tsx`: the existing Leaflet 1.9.4 map is bundled locally instead of loaded from a CDN; map tiles still come from OpenStreetMap.

API paths, payloads, types, backend calculations and the static-export route remain unchanged.

## Verification

Run `npm run build` for compilation, lint and type checks. Run `node scripts/review-ui.cjs` with a local frontend at port 3001, a Playwright module available via `PLAYWRIGHT_MODULE`, and Chrome via `CHROME_PATH` (or the default Windows installation).

The browser check first inspects the real catalogue, logo and fully loaded map tiles, then intercepts API responses with explicit contract fixtures to exercise success and failure states reproducibly. These fixtures are never imported by the application. It checks all three views at 1440, 1024, 768, 390 and 320px, keyboard selection, state retention, request bodies, map popups and zoom, overlay stacking, inspector collapse, dialog focus restoration, chart rendering after navigation, 200% text scaling, reduced motion, and errors. Screenshots and the machine-readable report are written to `artifacts/deep-redesign`. The local `artifacts/comparacao.html` compares these screenshots with the prior implementation.

Live external data availability and microphone permission/recognition depend on the network and browser and are separate from the fixture-based workflow checks.
