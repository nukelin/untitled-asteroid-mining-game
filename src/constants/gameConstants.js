// ─── Travel ───────────────────────────────────────────────────────────────────
// How many fuel units are consumed every time the player travels to a new location.
export const TRAVEL_COST = 20

// ─── Ship Services ────────────────────────────────────────────────────────────
// Credit cost to restore 1 point of armor (hull HP) at a repair station.
export const REPAIR_COST_PER_HP = 0.5
// Credit cost to refill 1 unit of fuel at a refueling station.
export const REFUEL_COST_PER_UNIT = 2

// ─── Travel Timing ────────────────────────────────────────────────────────────
// How long (in milliseconds) a travel operation takes.
export const TRAVEL_DURATION_MS = 8000
// How often (in milliseconds) the travel tick fires to update progress.
export const TRAVEL_TICK_MS = 100

// ─── Mining Timing ────────────────────────────────────────────────────────────
// How often (in milliseconds) the mining tick fires to update progress and drain fuel.
export const MINING_TICK_MS = 250
// Shortest possible mining operation duration (milliseconds).
export const MINING_DURATION_MIN = 5000
// Longest possible mining operation duration (milliseconds).
export const MINING_DURATION_MAX = 10000

// ─── Mining Yield ─────────────────────────────────────────────────────────────
// Minimum kg of ore produced when a mining operation completes.
export const MINING_YIELD_MIN = 10
// Maximum kg of ore produced when a mining operation completes.
export const MINING_YIELD_MAX = 50
// Fuel drained per real-world second while a mining operation is active.
export const MINING_FUEL_DRAIN_PER_SECOND = 0.2

// ─── Ore Definitions ──────────────────────────────────────────────────────────
// The four ore types the player can mine and sell.
export const ORE_TYPES = ['iron', 'nickel', 'cobalt', 'gold']

// Relative spawn weights used for weighted-random ore selection.
// Higher numbers mean that ore is more likely to be targeted when a mine starts.
// Total weight = 100, so iron has a 60% chance, gold only 3%.
export const ORE_WEIGHTS = { iron: 60, nickel: 25, cobalt: 12, gold: 3 }

// Per-ore difficulty modifiers applied when the player chooses a specific ore.
// durationMult scales the mining duration; yieldMult scales the kg produced.
// Rarer ores take longer but yield less per run (though their high price makes them worth it).
export const ORE_MODIFIERS = {
  iron:   { durationMult: 1.0,  yieldMult: 1.0  },
  nickel: { durationMult: 1.5,  yieldMult: 0.8  },
  cobalt: { durationMult: 2.5,  yieldMult: 0.5  },
  gold:   { durationMult: 5.0,  yieldMult: 0.25 },
}

// ─── Location Action Menus ────────────────────────────────────────────────────
// Maps each location ID to the list of services available there.
// These labels are shown in the legacy LocationOptions component.
export const LOCATION_OPTIONS = {
  earth: ['Market', 'Repair', 'Refuel'],
  mainBelt: ['Mine', 'Leave'],
}

// ─── Travel Destinations ──────────────────────────────────────────────────────
// All destinations the player can travel to.
// `id` is the internal location key; `label` is the human-readable name shown in the UI.
export const TRAVEL_DESTINATIONS = [
  { id: 'earth', label: 'Earth' },
  { id: 'mainBelt', label: 'Main Belt' },
]

// ─── Utility: ASCII Progress Bar ──────────────────────────────────────────────
// Renders a fixed-width text bar showing how full current/max is.
// Example: renderBar(7, 10, 10) → "[#######   ]"
//   current – the current value (e.g. ship.fuel)
//   max     – the maximum value (e.g. ship.fuelMax)
//   width   – total number of characters inside the brackets (default 10)
export function renderBar(current, max, width = 10) {
  const filled = Math.round((current / max) * width) // how many '#' chars to draw
  const empty = width - filled                        // remaining spaces
  return '[' + '#'.repeat(filled) + ' '.repeat(empty) + ']'
}

// ─── Utility: Format Money ────────────────────────────────────────────────────
// Converts a numeric credit amount into a dollar-sign prefixed string.
// Uses US locale formatting (e.g. 1500 → "$1,500").
// Up to two decimal places are shown if present.
export function formatMoney(amount) {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// ─── Utility: Build Action Item List ─────────────────────────────────────────
// Returns the array of selectable action items for the current game context.
// The list always includes "Start/Stop Mining" and "Travel".
// Earth-only actions (Market, Repair Ship, Refuel Ship) are appended when at Earth.
//   location    – current location ID (e.g. 'earth' | 'mainBelt')
//   miningActive – whether a mining operation is currently in progress
export function getActionItems(location, miningActive) {
  const items = [
    // Label toggles between "Stop Mining" and "Start Mining" depending on state.
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

// ─── Utility: Pick Weighted Random Ore ───────────────────────────────────────
// Selects one ore type at random, weighted by ORE_WEIGHTS.
// Algorithm: sum all weights, pick a random number in [0, total),
// then iterate through ores subtracting each weight until the running value
// drops to 0 or below — that ore is the winner.
// Falls back to 'iron' in the extremely unlikely case of floating-point drift.
export function pickWeightedOre() {
  const total = Object.values(ORE_WEIGHTS).reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (const [ore, weight] of Object.entries(ORE_WEIGHTS)) {
    rand -= weight
    if (rand <= 0) return ore
  }
  return 'iron' // fallback — should never be reached
}
