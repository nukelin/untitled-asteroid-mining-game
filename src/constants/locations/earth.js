import { REPAIR_COST_PER_HP, REFUEL_COST_PER_UNIT } from '../shipServices'
import { MARKET_PRICES } from '../ores'

const msg = (state, text) => ({ ...state, ui: { ...state.ui, message: text } })

export default {
  id: 'earth',
  label: 'Earth',
  actions: [
    { id: 'market', label: 'Market' },
    { id: 'repair', label: 'Repair Ship' },
    { id: 'refuel', label: 'Refuel Ship' },
  ],

  handlers: {
    repair(state) {
      const hpMissing = state.ship.armorMax - state.ship.armor
      if (hpMissing <= 0) return msg(state, 'Hull is fully intact.')
      const cost = hpMissing * REPAIR_COST_PER_HP
      if (state.money < cost) return msg(state, 'Insufficient credits!')
      return { ...state, money: state.money - cost, ship: { ...state.ship, armor: state.ship.armorMax } }
    },

    refuel(state) {
      const fuelMissing = state.ship.fuelMax - state.ship.fuel
      if (fuelMissing <= 0) return msg(state, 'Tank is full.')
      const cost = fuelMissing * REFUEL_COST_PER_UNIT
      if (state.money < cost) return msg(state, 'Insufficient credits!')
      return { ...state, money: state.money - cost, ship: { ...state.ship, fuel: state.ship.fuelMax } }
    },

    sell_ore(state, { oreType }) {
      const qty = state.inventory[oreType]
      if (!qty || qty <= 0) return msg(state, 'Nothing to sell!')
      const earnings = qty * (MARKET_PRICES[oreType] || 0)
      return {
        ...state,
        money: state.money + earnings,
        inventory: { ...state.inventory, [oreType]: 0 },
        ship: { ...state.ship, cargoUsed: state.ship.cargoUsed - qty },
      }
    },
  },
}
