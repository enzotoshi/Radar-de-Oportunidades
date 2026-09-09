const assert = require('node:assert/strict')
const fs = require('node:fs')

assert.equal(
  fs.existsSync('src/styles/tokens.css'),
  true,
  'The shared design tokens must exist before components can depend on them.',
)

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
]) {
  assert.match(tokens, new RegExp(token), `Missing token ${token}`)
}

assert.match(layout, /@fontsource-variable\/ibm-plex-sans/)
assert.doesNotMatch(globals, /font-size:\s*\.5rem/)
assert.doesNotMatch(globals, /font-size:\s*\.5625rem/)

console.log('UI architecture checks passed')
