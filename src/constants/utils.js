import { ORE_WEIGHTS } from './ores'
import { LOCATIONS_BY_ID } from './locations'

// Renders a fixed-width text bar showing how full current/max is.
// Example: renderBar(7, 10, 10) → "[#######   ]"
//   current – the current value (e.g. ship.fuel)
//   max     – the maximum value (e.g. ship.fuelMax)
//   width   – total number of characters inside the brackets (default 10)
export function renderBar(current, max, width = 10) {
  const filled = Math.round((current / max) * width)
  const empty = width - filled
  return '[' + '#'.repeat(filled) + ' '.repeat(empty) + ']'
}

// Converts a numeric credit amount into a dollar-sign prefixed string.
// Uses US locale formatting (e.g. 1500 → "$1,500").
export function formatMoney(amount) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// Returns the array of selectable action items for the current location.
// Driven entirely by the location definition — labels live in the location file.
// The mineToggle label is overridden at runtime based on current mining state.
//   locationId   – current location ID (e.g. 'earth' | 'mainBelt')
//   miningActive – whether a mining operation is currently in progress
export function getActionItems(locationId, miningActive) {
  const loc = LOCATIONS_BY_ID[locationId]
  if (!loc) return [{ id: 'travel', label: 'Travel' }]

  return [
    ...loc.actions.map(a =>
      a.id === 'mineToggle' ? { ...a, label: miningActive ? 'Stop Mining' : 'Start Mining' } : a
    ),
    { id: 'travel', label: 'Travel' },
  ]
}

// Selects one ore type at random, weighted by ORE_WEIGHTS.
// Falls back to 'iron' in the extremely unlikely case of floating-point drift.
export function pickWeightedOre() {
  const total = Object.values(ORE_WEIGHTS).reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (const [ore, weight] of Object.entries(ORE_WEIGHTS)) {
    rand -= weight
    if (rand <= 0) return ore
  }
  return 'iron'
}
