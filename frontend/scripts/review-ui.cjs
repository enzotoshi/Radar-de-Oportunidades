const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require('playwright-core')
const AxeBuilder = require('@axe-core/playwright').default

const baseURL = process.env.REVIEW_URL || 'http://127.0.0.1:3001'
const destination = path.resolve('artifacts/atlas-operacional')

const location = {
  address: 'Avenida Paulista, Bela Vista, Sao Paulo, SP', lat: -23.5614, lng: -46.6559,
  municipality: { ibge_code: '3550308', name: 'Sao Paulo', state: 'SP' },
}
const analysis = {
  opportunity_score: 72.5, score_label: 'Indice da metodologia propria',
  classification: 'Indice alto na metodologia propria', location,
  business_type: 'cafeteria', radius_meters: 1500,
  metrics: {
    competitors: { label: 'Concorrencia', value: 24, unit: '', kind: 'real', source: 'OpenStreetMap', reference: '2026', description: 'Estabelecimentos mapeados no raio.' },
    infrastructure: { label: 'Infraestrutura', value: 71, unit: 'pontos', kind: 'calculated', source: 'Metodologia propria', reference: '2026', description: 'Componente calculado.' },
    mobility: { label: 'Mobilidade', value: 64, unit: 'pontos', kind: 'estimated', source: 'OpenStreetMap', reference: '2026', description: 'Estimativa identificada.' },
    population: { label: 'Populacao', value: 28314, unit: 'pessoas', kind: 'real', source: 'IBGE', reference: '2022', description: 'Populacao observada.' },
    gdp: { label: 'PIB per capita', value: 350000, unit: 'BRL', kind: 'calculated', source: 'IBGE', reference: '2023', description: 'Valor territorial calculado.' },
    availability: { label: 'Dado complementar', value: null, unit: '', kind: 'estimated', source: 'Fonte indisponivel', reference: null, description: 'Ausencia mantida explicita.' },
  },
  business_markers: [{ id: 'one', name: 'Estabelecimento de teste', category: 'cafe', lat: -23.562, lng: -46.656, icon: '☕' }],
  sources: [{ name: 'OpenStreetMap', url: 'https://www.openstreetmap.org', status: 'ok', license: 'ODbL', reference: '2026' }],
  collected_at: '2026-09-08T20:00:00Z', explanation: 'Dados exclusivos do teste de interface.', recommendation: 'Validar os dados em campo.',
  methodology: { formula: 'Componentes ponderados', competition: 'A', infrastructure: 'B', mobility: 'C', components: { overall: 72.5, competition: 30, infrastructure: 22, mobility: 20.5 } },
  warnings: ['A cobertura varia por local.'],
}
const simulation = {
  original_score: 72.5, projected_score: 80, delta: 7.5,
  projections: Array.from({ length: 5 }, (_, index) => ({ year: 2027 + index, label: String(2027 + index), score: 74 + index * 1.5 })),
  explanation: 'Projecao calculada para o teste.', key_factors: ['Hipotese populacional'], assumptions: { population: 12 },
  methodology: 'Metodologia do teste de contrato', source_analysis_at: analysis.collected_at,
}
const game = {
  total_score: 725, competition_component: 300, infrastructure_component: 220, mobility_component: 205,
  classification: 'Resultado educacional', feedback: 'Confira as fontes e limites.', tips: ['Verifique a cobertura local.'],
  methodology: 'Componentes ponderados', source_analysis_at: analysis.collected_at,
}

async function waitForMap(page, selector) {
  await page.locator(`${selector} .leaflet-container`).waitFor({ state: 'attached' })
  assert.equal(await page.locator(selector).isVisible(), true, `${selector} must remain visible while Leaflet initializes`)
  await page.waitForFunction(value => [...document.querySelectorAll(`${value} .leaflet-tile`)].some(tile => tile.complete && tile.naturalWidth > 0), selector, { timeout: 30000 })
}

async function assertNoSeriousAxeViolations(page, state) {
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter(item => ['critical', 'serious'].includes(item.impact))
  assert.deepEqual(blocking.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })), [], `${state}: ${blocking.map(item => item.id).join(', ')}`)
}

async function waitForActiveView(page) {
  await page.waitForFunction(() => {
    const active = [...document.querySelectorAll('.view-stack > div')].find(element => !element.hasAttribute('hidden'))
    return active && Number(getComputedStyle(active).opacity) > .99
  })
}

async function main() {
  await fs.mkdir(destination, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  const calls = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('favicon')) errors.push(message.text()) })
  await page.route('**/api/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const fulfill = body => route.fulfill({ json: body, headers: { 'access-control-allow-origin': '*' } })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': '*', 'access-control-allow-headers': '*' } })
    if (url.pathname.endsWith('/businesses')) return fulfill({ businesses: [{ id: 'cafeteria', name: 'Cafeteria', icon: '☕', sector: 'Alimentação e bebidas' }, { id: 'academia', name: 'Academia', icon: '🏋️', sector: 'Saúde e bem-estar' }] })
    if (url.pathname.endsWith('/geocode')) return fulfill({ results: [{ ...location, display_name: location.address, place_id: 'test', source: 'Nominatim' }] })
    calls.push({ path: url.pathname, body: request.postDataJSON() })
    if (url.pathname.endsWith('/analyze-with-ai')) { await new Promise(resolve => setTimeout(resolve, 80)); return fulfill(analysis) }
    if (url.pathname.endsWith('/simulate')) { await new Promise(resolve => setTimeout(resolve, 80)); return fulfill(simulation) }
    if (url.pathname.endsWith('/gamification/score')) { await new Promise(resolve => setTimeout(resolve, 80)); return fulfill(game) }
    return route.abort()
  })

  try {
    await page.goto(baseURL)
    await page.locator('#hero-title').waitFor({ state: 'attached' })
    await page.waitForTimeout(2000)
    assert.equal(await page.locator('#hero-title').isVisible(), true, `Landing hero must be visible; ${JSON.stringify(errors)}`)
    assert.equal(await page.getByRole('navigation', { name: /principal/i }).count(), 1)
    assert.equal(await page.getByRole('link', { name: /Explorar Radar/ }).getAttribute('href'), '/radar')
    assert.equal(await page.locator('a[href$="/radar"]').count(), 3)
    await assertNoSeriousAxeViolations(page, 'landing page')
    for (const width of [1440, 1024, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 900 })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
      assert.equal(overflow, false, `Landing horizontal overflow: ${width}px`)
      if (width === 375) {
        await page.locator('#problem-title').scrollIntoViewIfNeeded()
        const mobileCards = page.getByRole('region', { name: /transforma dados em oportunidades/i })
        await mobileCards.scrollIntoViewIfNeeded()
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('#como-funciona')).opacity) > .99)
        const mobileBenefits = page.getByRole('region', { name: /Mais clareza/i })
        await mobileBenefits.scrollIntoViewIfNeeded()
        await page.waitForFunction(() => {
          const panels = document.querySelector('#benefits-title')?.parentElement?.nextElementSibling
          return panels && Number(getComputedStyle(panels).opacity) > .99
        })
        await page.screenshot({ path: path.join(destination, '00-landing-mobile.png'), fullPage: true })
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.locator('#problem-title').scrollIntoViewIfNeeded()
    const featureCards = page.getByRole('region', { name: /transforma dados em oportunidades/i })
    await featureCards.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('#como-funciona')).opacity) > .99)
    assert.equal(await featureCards.getByRole('article').count(), 1)
    await featureCards.getByRole('heading', { name: 'Do dado bruto ao sinal certo.' }).waitFor()
    const benefitsSection = page.getByRole('region', { name: /Mais clareza/i })
    await benefitsSection.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => {
      const panels = document.querySelector('#benefits-title')?.parentElement?.nextElementSibling
      return panels && Number(getComputedStyle(panels).opacity) > .99
    })
    assert.equal(await benefitsSection.getByRole('article').count(), 4)
    await benefitsSection.getByRole('heading', { name: 'Mais clareza. Menos esforço.' }).waitFor()
    await assertNoSeriousAxeViolations(page, 'landing page revelada')
    await page.screenshot({ path: path.join(destination, '00-landing.png'), fullPage: true })
    await page.getByRole('link', { name: /Explorar Radar/ }).click()
    await page.waitForURL(/\/radar\/?$/)
    await page.getByRole('banner').waitFor()
    assert.equal(await page.getByRole('navigation', { name: 'Áreas do Radar' }).count(), 1)
    assert.equal(await page.locator('.app-header .primary-navigation').count(), 1)
    assert.equal(await page.locator('.app-header').evaluate(element => element.getBoundingClientRect().height <= 84), true)
    await page.getByRole('heading', { name: 'Explore oportunidades.' }).waitFor()
    await page.getByRole('region', { name: 'Configurar análise' }).waitFor()
    assert.equal(await page.locator('.atlas-query').count(), 1)
    await waitForMap(page, '.atlas-map')
    await assertNoSeriousAxeViolations(page, 'estado inicial')
    await page.screenshot({ path: path.join(destination, '01-explorar-inicial.png'), fullPage: true })

    await page.getByRole('button', { name: 'Simular' }).click()
    await page.getByRole('region', { name: 'Laboratório de cenários sem análise' }).waitFor()
    await page.screenshot({ path: path.join(destination, '01-simulacao-vazia.png'), fullPage: true })
    await page.getByRole('button', { name: 'Modo investidor' }).click()
    await page.getByRole('region', { name: 'Quadro do investidor sem análise' }).waitFor()
    await page.screenshot({ path: path.join(destination, '01-investidor-vazio.png'), fullPage: true })
    await page.getByRole('button', { name: 'Explorar' }).click()

    const address = page.getByRole('combobox', { name: 'Localização' })
    await address.fill('Avenida Paulista')
    const option = page.getByRole('option', { name: /Avenida Paulista/ })
    await option.waitFor()
    await page.getByRole('button', { name: 'Buscar endereço e usar a primeira sugestão' }).click()
    await page.getByText(/Local verificado/).waitFor()
    await page.getByRole('button', { name: 'Selecione um negócio' }).click()
    await page.getByPlaceholder('🔍 Buscar tipo de negócio...').fill('academia')
    await page.getByRole('option', { name: /Academia/ }).waitFor()
    await page.getByPlaceholder('🔍 Buscar tipo de negócio...').fill('cafeteria')
    await page.getByRole('option', { name: /Cafeteria/ }).click()
    assert.equal(await page.locator('#analysis-budget').inputValue(), '')
    assert.equal(await page.locator('#analysis-budget').getAttribute('placeholder'), 'Digite o valor...')
    await page.locator('#analysis-budget').fill('125000')
    assert.equal(await page.locator('#analysis-budget').inputValue(), '125.000')
    await page.getByRole('button', { name: 'Analisar dados reais' }).click()
    await page.getByRole('button', { name: 'Analisando fontes...' }).waitFor()
    await page.getByRole('complementary', { name: 'Evidências da oportunidade' }).waitFor()
    assert.equal(await page.locator('[data-metric-kind="real"]').count(), 2)
    assert.equal(await page.getByText('Sinais que formam o índice').count(), 1)
    assert.equal(await page.getByText('Contexto do território').count(), 1)
    await page.waitForFunction(() => document.querySelectorAll('.atlas-map .custom-marker').length === 2)
    const businessMarker = page.locator('.atlas-map .map-marker--business')
    assert.equal(await businessMarker.textContent(), '☕')
    assert.deepEqual(await businessMarker.evaluate(element => {
      const style = getComputedStyle(element)
      return { background: style.backgroundColor, border: style.borderTopWidth, radius: style.borderRadius, shadow: style.boxShadow }
    }), { background: 'rgba(0, 0, 0, 0)', border: '0px', radius: '0px', shadow: 'none' })
    await page.locator('.atlas-map .leaflet-marker-icon').first().click({ force: true })
    await page.locator('.atlas-map .leaflet-popup-content').waitFor()
    await page.locator('.atlas-map .leaflet-popup-close-button').click()
    const detailTrigger = page.getByRole('button', { name: 'Fontes e metodologia', exact: true })
    await detailTrigger.click()
    await page.getByRole('dialog').waitFor()
    await page.getByRole('link', { name: /OpenStreetMap.*ok/ }).waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog').waitFor({ state: 'hidden' })
    assert.equal(await detailTrigger.evaluate(element => element === document.activeElement), true)
    assert.deepEqual(calls.find(call => call.path.endsWith('/analyze-with-ai')).body, { address: location.address, business_type: 'cafeteria', lat: location.lat, lng: location.lng, budget: 125000, municipality_ibge_code: '3550308', municipality_name: 'Sao Paulo', municipality_state: 'SP' })
    await assertNoSeriousAxeViolations(page, 'resultado da análise')
    await page.screenshot({ path: path.join(destination, '02-explorar-resultado.png'), fullPage: true })

    await page.getByRole('button', { name: 'Simular' }).click()
    await page.getByRole('heading', { name: 'Laboratório de cenários' }).waitFor()
    await page.getByRole('region', { name: 'Hipóteses do cenário' }).waitFor()
    assert.equal(await page.getByRole('slider').count(), 3)
    await page.getByRole('slider').first().focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await page.getByRole('slider').first().inputValue(), '1')
    await page.getByRole('button', { name: 'Gerar projeção do sistema' }).click()
    await page.getByRole('button', { name: 'Calculando projeção...' }).waitFor()
    await page.getByRole('region', { name: 'Trajetória projetada' }).waitFor()
    await page.getByText('Valores da projeção').click()
    assert.equal(await page.locator('.chart-values tbody tr').count(), 6)
    assert.deepEqual(calls.find(call => call.path.endsWith('/simulate')).body, { address: location.address, business_type: 'cafeteria', lat: location.lat, lng: location.lng, population_growth: 1, income_growth: 0, new_competitors: 0 })
    await assertNoSeriousAxeViolations(page, 'simulação')
    await page.screenshot({ path: path.join(destination, '03-simulacao.png'), fullPage: true })

    await page.getByRole('button', { name: 'Modo investidor' }).click()
    await page.getByRole('heading', { name: 'Quadro do investidor' }).waitFor()
    await page.getByRole('button', { name: 'Calcular pontuação educacional' }).click()
    await page.getByRole('button', { name: 'Consultando...' }).waitFor()
    await page.getByRole('region', { name: 'Composição da pontuação' }).waitFor()
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.investor-result')).opacity) > .99)
    assert.equal(await page.getByRole('meter').count(), 3)
    assert.equal(await page.locator('.confetti-piece').count(), 0)
    assert.deepEqual(calls.find(call => call.path.endsWith('/gamification/score')).body, { address: location.address, business_type: 'cafeteria', lat: location.lat, lng: location.lng })
    await assertNoSeriousAxeViolations(page, 'quadro do investidor')
    await page.screenshot({ path: path.join(destination, '04-investidor.png'), fullPage: true })

    const layouts = []
    for (const width of [1440, 1024, 768, 375, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (const name of ['Explorar', 'Simular', 'Modo investidor']) {
        await page.getByRole('button', { name }).click()
        await waitForActiveView(page)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
        assert.equal(overflow, false, `Horizontal overflow: ${width}px, ${name}`)
        layouts.push({ width, area: name, overflow })
      }
      if (width === 375) await page.screenshot({ path: path.join(destination, '05-mobile-investidor.png'), fullPage: true })
    }

    await page.setViewportSize({ width: 375, height: 900 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    for (const name of ['Explorar', 'Simular', 'Modo investidor']) {
      await page.getByRole('button', { name }).click()
      await waitForActiveView(page)
      const reflow = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        offenders: [...document.querySelectorAll('body *')].map(element => {
          const rect = element.getBoundingClientRect()
          return { tag: element.tagName, className: typeof element.className === 'string' ? element.className : '', right: Math.round(rect.right), width: Math.round(rect.width) }
        }).filter(item => item.right > innerWidth + 1 || item.width > innerWidth + 1).slice(0, 12),
      }))
      assert.equal(reflow.overflow, false, `Text scaling overflow: ${name}; ${JSON.stringify(reflow.offenders)}`)
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = '' })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.getByRole('button', { name: 'Reavaliar os mesmos dados' }).click()
    await page.getByRole('button', { name: 'Calcular pontuação educacional' }).click()
    await page.getByRole('region', { name: 'Composição da pontuação' }).waitFor()
    assert.equal(await page.locator('.radar-sweep').count(), 0)

    await page.getByRole('button', { name: 'Explorar' }).click()
    await page.getByRole('button', { name: 'Limpar resultado da análise' }).click()
    assert.deepEqual(errors, [], 'Unexpected console errors before the intentional 503 flow')
    await page.route('**/api/analyze-with-ai', route => route.fulfill({ status: 503, json: { detail: 'Fonte indisponivel no teste.' } }))
    await page.getByRole('button', { name: 'Analisar dados reais' }).click()
    await page.getByRole('alert').filter({ hasText: 'Fonte indisponivel no teste.' }).waitFor()
    assert.equal(await page.locator('.result-panel').count(), 0)
    for (let index = errors.length - 1; index >= 0; index -= 1) if (errors[index].includes('503')) errors.splice(index, 1)
    assert.deepEqual(errors, [])

    const report = { passed: true, layouts, requests: calls, axe: '0 critical/serious', errors }
    await fs.writeFile(path.join(destination, 'report.json'), JSON.stringify(report, null, 2))
    console.log(JSON.stringify({ passed: true, layoutsChecked: layouts.length, axe: report.axe, errors, artifacts: destination }, null, 2))
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
