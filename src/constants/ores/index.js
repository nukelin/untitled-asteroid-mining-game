import iron from './iron'
import nickel from './nickel'
import cobalt from './cobalt'
import gold from './gold'

const ALL_ORES = [iron, nickel, cobalt, gold]

export const ORE_TYPES    = ALL_ORES.map(ore => ore.id)
export const ORE_WEIGHTS  = Object.fromEntries(ALL_ORES.map(ore => [ore.id, ore.weight]))
export const ORE_MODIFIERS = Object.fromEntries(ALL_ORES.map(ore => [ore.id, { durationMult: ore.durationMult, yieldMult: ore.yieldMult }]))
export const MARKET_PRICES = Object.fromEntries(ALL_ORES.map(ore => [ore.id, ore.marketPrice]))
