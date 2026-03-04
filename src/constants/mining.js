// How often (in milliseconds) the mining tick fires to update progress and drain fuel.
export const MINING_TICK_MS = 250
// Shortest possible mining operation duration (milliseconds).
export const MINING_DURATION_MIN = 5000
// Longest possible mining operation duration (milliseconds).
export const MINING_DURATION_MAX = 10000

// Minimum kg of ore produced when a mining operation completes.
export const MINING_YIELD_MIN = 10
// Maximum kg of ore produced when a mining operation completes.
export const MINING_YIELD_MAX = 50
// Fuel drained per real-world second while a mining operation is active.
export const MINING_FUEL_DRAIN_PER_SECOND = 0.2
