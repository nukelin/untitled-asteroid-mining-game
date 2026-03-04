import { MINING_DURATION_MIN, MINING_DURATION_MAX, MINING_YIELD_MIN, MINING_YIELD_MAX, MINING_FUEL_DRAIN_PER_SECOND } from '../mining'
import { ORE_MODIFIERS } from '../ores'

const msg = (state, text) => ({ ...state, ui: { ...state.ui, message: text } })
const idleMining = (state) => ({ active: false, oreType: null, progress: 0, durationMs: 0, startedAt: null, fuelAtStart: state.ship.fuel })

export default {
  id: 'mainBelt',
  label: 'Main Belt',
  actions: [
    { id: 'mineToggle', label: 'Start Mining' }, // label is overridden at runtime based on mining state
  ],

  handlers: {
    mineToggle(state) {
      if (state.mining.active) return { ...state, mining: idleMining(state) }
      return { ...state, ui: { ...state.ui, actionSubView: 'mineOre', mineOreIndex: 0 } }
    },

    start_mining(state, { oreType }) {
      if (state.ship.cargoUsed >= state.ship.cargoMax) return msg(state, 'Cargo hold full!')
      if (state.mining.active) return state
      const { durationMult } = ORE_MODIFIERS[oreType] ?? ORE_MODIFIERS.iron
      const durationMs = (MINING_DURATION_MIN + Math.random() * (MINING_DURATION_MAX - MINING_DURATION_MIN)) * durationMult
      return {
        ...state,
        mining: { active: true, oreType, progress: 0, durationMs, startedAt: Date.now(), fuelAtStart: state.ship.fuel },
      }
    },

    tick_mining(state, { now }) {
      if (!state.mining.active) return state
      const elapsed = now - state.mining.startedAt
      const progress = Math.min(1, elapsed / state.mining.durationMs)
      const newFuel = Math.max(0, state.mining.fuelAtStart - (elapsed / 1000) * MINING_FUEL_DRAIN_PER_SECOND)
      const s = { ...state, ship: { ...state.ship, fuel: newFuel } }

      if (newFuel <= 0) {
        return { ...s, ship: { ...s.ship, fuel: 0 }, mining: idleMining(s) }
      }
      if (progress >= 1) {
        const freeSpace = s.ship.cargoMax - s.ship.cargoUsed
        if (freeSpace <= 0) return { ...s, mining: idleMining(s) }
        const oreType = s.mining.oreType
        const { yieldMult } = ORE_MODIFIERS[oreType] ?? ORE_MODIFIERS.iron
        const rawYield = (MINING_YIELD_MIN + Math.random() * (MINING_YIELD_MAX - MINING_YIELD_MIN)) * yieldMult
        const yieldKg = Math.round(Math.min(rawYield, freeSpace))
        return {
          ...s,
          inventory: { ...s.inventory, [oreType]: s.inventory[oreType] + yieldKg },
          ship: { ...s.ship, cargoUsed: s.ship.cargoUsed + yieldKg },
          mining: idleMining(s),
        }
      }
      return { ...s, mining: { ...s.mining, progress } }
    },

    cancel_mining(state) {
      return { ...state, mining: idleMining(state) }
    },
  },
}
