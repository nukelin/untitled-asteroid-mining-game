import { REPAIR_COST_PER_HP, REFUEL_COST_PER_UNIT } from '../shipServices'
import { MARKET_PRICES } from '../ores'

// Sets a transient flash message shown briefly in the status bar (for errors/warnings).
const msg = (state, text) => ({ ...state, ui: { ...state.ui, message: text } })
// Prepends a permanent entry to the activity log (for successful actions).
const addLog = (state, text) => ({ ...state, ui: { ...state.ui, log: [text, ...(state.ui.log ?? [])].slice(0, 10) } })
// Simple dollar formatter for log messages (e.g. 1500 → "$1,500").
const fmt = (n) => '$' + n.toLocaleString('en-US')

export default {
  id: 'earth',
  label: 'Earth',
  actions: [
    { id: 'sell',  label: 'Sell'  },        // opens the buyer country picker
    { id: 'shop',  label: 'Shop'  },        // opens the upgrade shop
    { id: 'equip', label: 'Equip' },        // opens the equip screen
    { id: 'repair', label: 'Repair Ship' },
    { id: 'refuel', label: 'Refuel Ship' },
  ],

  handlers: {
    repair(state) {
      const hpMissing = state.ship.armorMax - state.ship.armor
      if (hpMissing <= 0) return msg(state, 'Hull is fully intact.')
      const cost = hpMissing * REPAIR_COST_PER_HP
      if (state.money < cost) return msg(state, 'Insufficient credits!')
      const repairedState = { ...state, money: state.money - cost, ship: { ...state.ship, armor: state.ship.armorMax } }
      return addLog(repairedState, `Hull repaired for ${fmt(cost)}.`)
    },

    refuel(state) {
      const fuelMissing = state.ship.fuelMax - state.ship.fuel
      if (fuelMissing <= 0) return msg(state, 'Tank is full.')
      const cost = fuelMissing * REFUEL_COST_PER_UNIT
      if (state.money < cost) return msg(state, 'Insufficient credits!')
      const refeledState = { ...state, money: state.money - cost, ship: { ...state.ship, fuel: state.ship.fuelMax } }
      return addLog(refeledState, `Tank refueled for ${fmt(cost)}.`)
    },

    sell_ore(state, { oreType, price }) {
      const qty = state.inventory[oreType]
      if (!qty || qty <= 0) return msg(state, 'Nothing to sell!')
      // Use the buyer's negotiated price if provided, fall back to base market price for safety
      const earnings = qty * (price ?? MARKET_PRICES[oreType] ?? 0)
      const soldState = {
        ...state,
        money: state.money + earnings,
        inventory: { ...state.inventory, [oreType]: 0 },
        ship: { ...state.ship, cargoUsed: state.ship.cargoUsed - qty },
      }
      return addLog(soldState, `Sold ${qty.toLocaleString()} kg of ${oreType} for ${fmt(earnings)}.`)
    },
  },
}
