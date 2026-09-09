const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')

const source = fs.readFileSync('src/lib/formatters.ts', 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText
const moduleUnderTest = { exports: {} }
vm.runInNewContext(compiled, { module: moduleUnderTest, exports: moduleUnderTest.exports, require })
const { formatBudgetInput, parseBudgetInput } = moduleUnderTest.exports

for (const [raw, formatted] of [
  ['', ''],
  ['1000', '1.000'],
  ['10000', '10.000'],
  ['100000', '100.000'],
  ['1000000', '1.000.000'],
  ['2500000', '2.500.000'],
]) assert.equal(formatBudgetInput(raw), formatted)

assert.equal(parseBudgetInput('1.000'), 1000)
assert.equal(parseBudgetInput('1.000.000'), 1000000)
assert.equal(parseBudgetInput(''), undefined)

const addressCombobox = fs.readFileSync('src/components/analysis/AddressCombobox.tsx', 'utf8')
assert.match(addressCombobox, /setTimeout\(\(\) => void search\(cleaned\), 350\)/)
assert.match(addressCombobox, /resultsRef\.current\[0\]/)
assert.match(addressCombobox, /search\(cleaned, true\)/)

const businessPicker = fs.readFileSync('src/components/analysis/BusinessPicker.tsx', 'utf8')
assert.match(businessPicker, /Buscar tipo de negócio/)
assert.equal((businessPicker.match(/^  '/gm) || []).length > 0, true)

console.log('Requirement checks passed')
