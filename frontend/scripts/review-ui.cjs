const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')

const baseURL = process.env.REVIEW_URL || 'http://127.0.0.1:3001'
const destination = path.resolve('artifacts/ui-review')

// Contract fixtures are confined to this browser test, never application data.
const location = {
  address: 'Avenida Paulista, Bela Vista, Sao Paulo, SP', lat: -23.5614, lng: -46.6559,
  municipality: { ibge_code: '3550308', name: 'Sao Paulo', state: 'SP' },
}
const analysis = {
  opportunity_score: 72.5, score_label: 'Indice da metodologia propria',
  classification: 'Indice alto na metodologia propria', location,
  business_type: 'cafeteria', radius_meters: 1500,
  metrics: Object.fromEntries(['Concorrencia', 'Infraestrutura', 'Mobilidade', 'Populacao', 'PIB', 'Dado indisponivel'].map((label, i) => [label, {
    label, value: i === 5 ? null : i === 4 ? 350000 : 24 + i, unit: i === 4 ? 'BRL' : '',
    kind: ['real', 'calculated', 'estimated'][i % 3], source: 'Fonte de teste contratual', reference: '2025', description: label,
  }])),
  business_markers: [{ id: 'one', name: 'Estabelecimento de teste', category: 'cafe', lat: -23.562, lng: -46.656 }],
  sources: [{ name: 'OpenStreetMap', url: 'https://www.openstreetmap.org', status: 'ok', license: 'ODbL', reference: '2026' }],
  collected_at: '2026-09-08T20:00:00Z',
  explanation: 'Dados exclusivos do teste de interface.', recommendation: 'Validar os dados em campo.',
  methodology: { formula: 'Componentes ponderados', competition: 'A', infrastructure: 'B', mobility: 'C', components: { overall: 72.5, competition: 30, infrastructure: 22, mobility: 20.5 } },
  warnings: ['A cobertura varia por local.'],
}
const simulation = {
  original_score: 72.5, projected_score: 80, delta: 7.5,
  projections: Array.from({ length: 5 }, (_, i) => ({ year: 2027 + i, label: String(2027 + i), score: 74 + i * 1.5 })),
  explanation: 'Projecao calculada para o teste.', key_factors: ['Hipotese populacional'], assumptions: { population: 12 },
  methodology: 'Metodologia do teste de contrato', source_analysis_at: analysis.collected_at,
}
const game = {
  total_score: 725, competition_component: 300, infrastructure_component: 220, mobility_component: 205,
  classification: 'Resultado educacional', feedback: 'Confira as fontes e limites.', tips: ['Verifique a cobertura local.'],
  methodology: 'Componentes ponderados', source_analysis_at: analysis.collected_at,
}

async function main() {
  await fs.mkdir(destination, { recursive: true })
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
  const errors = []
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(baseURL)
    await page.getByRole('heading', { name: 'Explore oportunidades.' }).waitFor()
    await page.waitForFunction(() => document.querySelector('.brand-logo')?.complete)
    await page.waitForFunction(() => [...document.querySelectorAll('.leaflet-tile')].some(tile => tile.complete && tile.naturalWidth > 0), { }, { timeout: 20000 }).catch(() => {})
    await page.screenshot({ path: path.join(destination, 'desktop-real.png'), fullPage: true })
    const real = await page.evaluate(() => ({
      businessOptions: document.querySelectorAll('#analysis-business option').length - 1,
      mapTiles: [...document.querySelectorAll('.leaflet-tile')].filter(tile => tile.complete && tile.naturalWidth > 0).length,
      logoLoaded: document.querySelector('.brand-logo')?.naturalWidth > 0,
    }))

    const calls = []
    await page.route('**/api/**', async route => {
      const request = route.request()
      const url = new URL(request.url())
      const fulfill = body => route.fulfill({ json: body, headers: { 'access-control-allow-origin': '*' } })
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*', 'access-control-allow-methods': '*', 'access-control-allow-headers': '*' } })
      if (url.pathname.endsWith('/businesses')) return fulfill({ businesses: [{ id: 'cafeteria', name: 'Cafeteria', icon: '', sector: 'Alimentacao' }] })
      if (url.pathname.endsWith('/geocode')) return fulfill({ results: [{ ...location, display_name: location.address, place_id: 'test', source: 'Nominatim' }] })
      calls.push({ path: url.pathname, body: request.postDataJSON() })
      if (url.pathname.endsWith('/analyze-with-ai')) return fulfill(analysis)
      if (url.pathname.endsWith('/simulate')) return fulfill(simulation)
      if (url.pathname.endsWith('/gamification/score')) return fulfill(game)
      return route.abort()
    })
    await page.reload()
    await page.locator('.nav-item').nth(1).click()
    await page.getByRole('heading', { name: /Fa.a primeiro/ }).waitFor()
    await page.getByRole('button', { name: 'Ir para o mapa' }).click()
    const address = page.getByRole('combobox', { name: /Localiza/ })
    await address.fill('Avenida Paulista')
    await address.press('Enter')
    await page.getByRole('option', { name: /Avenida Paulista/ }).waitFor()
    await address.press('Escape')
    await page.getByRole('listbox').waitFor({ state: 'detached' })
    assert.equal(await page.getByRole('listbox').count(), 0)
    await address.press('Enter')
    await page.getByRole('option', { name: /Avenida Paulista/ }).waitFor()
    await address.press('ArrowDown')
    await address.press('Enter')
    await page.locator('#analysis-business').selectOption('cafeteria')
    await page.locator('#analysis-budget').fill('125000')
    await page.locator('.nav-item').nth(2).click()
    await page.getByRole('heading', { name: /O desafio come/ }).waitFor()
    await page.locator('.nav-item').nth(0).click()
    assert.equal(await page.locator('#analysis-budget').inputValue(), '125000')
    assert.equal(await address.inputValue(), location.address)
    await page.getByRole('button', { name: 'Analisar dados reais' }).click()
    await page.locator('.result-panel').waitFor()
    await page.waitForFunction(() => document.querySelectorAll('.custom-marker').length === 2)
    await page.locator('.leaflet-marker-icon').first().click()
    await page.locator('.leaflet-popup-content').waitFor()
    await page.locator('.leaflet-popup-close-button').click()
    await page.locator('.leaflet-control-zoom-in').click()
    assert.equal(await page.locator('.metric-item').count(), 6)
    await page.screenshot({ path: path.join(destination, 'analysis-desktop.png'), fullPage: true })
    assert.deepEqual(calls.find(call => call.path.endsWith('/analyze-with-ai')).body, {
      address: location.address, business_type: 'cafeteria', lat: location.lat, lng: location.lng, budget: 125000,
    })
    await page.locator('.nav-item').nth(1).click()
    await page.getByRole('slider').first().focus()
    await page.keyboard.press('ArrowRight')
    assert.equal(await page.getByRole('slider').first().inputValue(), '1')
    await page.getByRole('button', { name: 'Gerar projeção do sistema' }).click()
    await page.getByText('Valores da projeção').click()
    assert.equal(await page.locator('.chart-values tbody tr').count(), 6)
    await page.screenshot({ path: path.join(destination, 'simulation-desktop.png'), fullPage: true })
    await page.locator('.nav-item').nth(2).click()
    await page.getByRole('button', { name: 'Calcular pontuação educacional' }).click()
    await page.getByRole('heading', { name: 'Resultado educacional' }).waitFor()
    assert.equal(await page.getByRole('meter').count(), 3)
    await page.screenshot({ path: path.join(destination, 'investor-desktop.png'), fullPage: true })
    await page.locator('.nav-item').nth(1).click()
    assert.equal(await page.getByRole('slider').first().inputValue(), '1')
    assert.equal(await page.locator('.chart-values tbody tr').count(), 6)

    const layouts = []
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      for (let tab = 0; tab < 3; tab++) {
        await page.locator('.nav-item').nth(tab).click()
        if (tab === 1) await page.waitForFunction(() => document.querySelector('.recharts-line-curve')?.getBBox().width > 100)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
        assert.equal(overflow, false, `Horizontal overflow: ${width}px, tab ${tab}`)
        layouts.push({ width, tab, overflow })
        if (width === 390) await page.screenshot({ path: path.join(destination, `mobile-${tab}.png`), fullPage: true })
      }
    }
    await page.setViewportSize({ width: 390, height: 900 })
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    for (let tab = 0; tab < 3; tab++) {
      await page.locator('.nav-item').nth(tab).click()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Text scaling overflow: tab ${tab}`)
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = '' })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.locator('.nav-item').nth(2).click()
    await page.getByRole('button', { name: 'Reavaliar os mesmos dados' }).click()
    await page.getByRole('button', { name: 'Calcular pontuação educacional' }).click()
    await page.getByRole('heading', { name: 'Resultado educacional' }).waitFor()
    assert.equal(await page.locator('.confetti-piece').count(), 0)
    await page.locator('.nav-item').nth(0).click()
    await page.getByRole('button', { name: 'Limpar resultado da análise' }).click()
    await page.locator('.nav-item').nth(1).click()
    await page.getByRole('heading', { name: /Fa.a primeiro/ }).waitFor()
    await page.locator('.nav-item').nth(0).click()
    await page.route('**/api/analyze-with-ai', route => route.fulfill({ status: 503, json: { detail: 'Fonte indisponivel no teste.' } }))
    await page.getByRole('button', { name: 'Analisar dados reais' }).click()
    await page.getByRole('alert').filter({ hasText: 'Fonte indisponivel no teste.' }).waitFor()
    assert.equal(await page.locator('.result-panel').count(), 0)
    assert.deepEqual(errors, [])
    await fs.writeFile(path.join(destination, 'report.json'), JSON.stringify({ real, layouts, requests: calls, errors, passed: true }, null, 2))
    console.log(JSON.stringify({ passed: true, real, layoutsChecked: layouts.length, errors, artifacts: destination }, null, 2))
  } finally {
    await browser.close()
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
