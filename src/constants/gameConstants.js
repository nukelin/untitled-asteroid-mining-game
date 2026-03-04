export const TRAVEL_COST = 20

export const REPAIR_COST_PER_HP = 0.5
export const REFUEL_COST_PER_UNIT = 2

export const MINING_TICK_MS = 250
export const MINING_DURATION_MIN = 5000
export const MINING_DURATION_MAX = 10000
export const MINING_YIELD_MIN = 10
export const MINING_YIELD_MAX = 50
export const MINING_FUEL_DRAIN_PER_SECOND = 0.2

export const ORE_TYPES = ['iron', 'nickel', 'cobalt', 'gold']
export const ORE_WEIGHTS = { iron: 60, nickel: 25, cobalt: 12, gold: 3 }

export const LOCATION_OPTIONS = {
  earth: ['Market', 'Repair', 'Refuel'],
  mainBelt: ['Mine', 'Leave'],
}

export const TRAVEL_DESTINATIONS = [
  { id: 'earth', label: 'Earth' },
  { id: 'mainBelt', label: 'Main Belt' },
]

export function renderBar(current, max, width = 10) {
  const filled = Math.round((current / max) * width)
  const empty = width - filled
  return '[' + '#'.repeat(filled) + ' '.repeat(empty) + ']'
}

export function formatMoney(amount) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function getActionItems(location, miningActive) {
  const items = [
    { id: 'mineToggle', label: miningActive ? 'Stop Mining' : 'Start Mining' },
    { id: 'travel', label: 'Travel' },
  ]
  if (location === 'earth') {
    items.push(
      { id: 'market', label: 'Market' },
      { id: 'repair', label: 'Repair Ship' },
      { id: 'refuel', label: 'Refuel Ship' },
    )
  }
  return items
}

export function pickWeightedOre() {
  const total = Object.values(ORE_WEIGHTS).reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (const [ore, weight] of Object.entries(ORE_WEIGHTS)) {
    rand -= weight
    if (rand <= 0) return ore
  }
  return 'iron'
}
