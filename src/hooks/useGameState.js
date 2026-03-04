import { useReducer, useEffect, useRef, useCallback } from 'react'
import { TRAVEL_COST, TRAVEL_DURATION_MS, TRAVEL_TICK_MS } from '../constants/travel'
import { MINING_TICK_MS } from '../constants/mining'
import { TRAVEL_DESTINATIONS, LOCATIONS_BY_ID } from '../constants/locations'
import { ORE_TYPES } from '../constants/ores'
import { BUYER_COUNTRIES, generateBuyerPrices } from '../constants/buyers'
import ALL_UPGRADES, { UPGRADES_BY_ID, UPGRADE_SLOTS } from '../constants/shipUpgrades'
import { getActionItems, formatMoney } from '../constants/utils'

const initialState = {
  ship: {
    armor: 100,
    armorMax: 100,
    fuel: 100,
    fuelMax: 100,
    cargoUsed: 0,
    cargoMax: 200000,  // 200,000 kg starting hold — fits ~10-20 mining passes
  },
  money: 10000000,     // $10,000,000 starting credits
  inventory: { iron: 0, nickel: 0, cobalt: 0, gold: 0 },
  upgrades: [],   // array of upgrade IDs the player has purchased (owned but not necessarily equipped)
  // One equipped upgrade ID per slot, or null if the slot is empty
  equipped: { armor: null, engine: null, cargo: null, mining: null },
  location: 'earth',
  mining: {
    active: false,
    oreType: null,
    progress: 0,
    durationMs: 0,
    startedAt: null,
    fuelAtStart: 100,
  },
  travel: {
    active: false,
    destination: null,
    progress: 0,
    startedAt: null,
  },
  ui: {
    actionIndex: 0,
    actionSubView: null,  // null | 'travel' | 'sell' | 'sellOre' | 'mineOre' | 'shop' | 'equip' | 'equipSlot'
    travelIndex: 0,
    marketIndex: 0,       // cursor position in the ore list inside sellOre view
    mineOreIndex: 0,
    buyerIndex: 0,        // cursor position in the buyer country list
    buyerPrices: null,    // generated price table: { america: { iron: N, ... }, ... }
    selectedBuyer: null,  // id of the buyer country the player chose
    shopIndex: 0,          // cursor position in the upgrade shop list
    equipSlotIndex: 0,     // cursor position in the slot list (equip view)
    equipUpgradeIndex: 0,  // cursor position in the upgrade list (equipSlot view)
    selectedEquipSlot: null, // slot id the player chose to modify
    message: null,
    log: [],  // array of strings — newest first, capped at 10 entries
  },
}

// Prepends a new message to the activity log and trims it to the 10 most recent entries.
// Used throughout the reducer to record successful player actions.
function addLog(state, text) {
  return { ...state, ui: { ...state.ui, log: [text, ...state.ui.log].slice(0, 10) } }
}

function reducer(state, action) {
  switch (action.type) {
    case 'MOVE_SELECTION': {
      if (state.travel.active) return state
      const { direction } = action.payload
      const delta = direction === 'up' ? -1 : 1

      if (state.ui.actionSubView === 'travel') {
        const max = TRAVEL_DESTINATIONS.length - 1
        const next = Math.max(0, Math.min(max, state.ui.travelIndex + delta))
        return { ...state, ui: { ...state.ui, travelIndex: next } }
      }

      // 'equip' view: player picks a slot to modify
      if (state.ui.actionSubView === 'equip') {
        const max = UPGRADE_SLOTS.length - 1
        const next = Math.max(0, Math.min(max, state.ui.equipSlotIndex + delta))
        return { ...state, ui: { ...state.ui, equipSlotIndex: next } }
      }

      // 'equipSlot' view: player picks which upgrade to put in the chosen slot
      // Options are: [None, ...owned upgrades for that slot]
      if (state.ui.actionSubView === 'equipSlot') {
        const slotUpgrades = ALL_UPGRADES.filter(
          u => u.slot === state.ui.selectedEquipSlot && state.upgrades.includes(u.id)
        )
        const max = slotUpgrades.length  // +1 for "None" option, then -1 = length
        const next = Math.max(0, Math.min(max, state.ui.equipUpgradeIndex + delta))
        return { ...state, ui: { ...state.ui, equipUpgradeIndex: next } }
      }

      // 'shop' view: player picks an upgrade to buy
      if (state.ui.actionSubView === 'shop') {
        const max = ALL_UPGRADES.length - 1
        const next = Math.max(0, Math.min(max, state.ui.shopIndex + delta))
        return { ...state, ui: { ...state.ui, shopIndex: next } }
      }

      // 'sell' view: player picks a buyer country
      if (state.ui.actionSubView === 'sell') {
        const max = BUYER_COUNTRIES.length - 1
        const next = Math.max(0, Math.min(max, state.ui.buyerIndex + delta))
        return { ...state, ui: { ...state.ui, buyerIndex: next } }
      }

      // 'sellOre' view: player picks which ore to sell to the chosen buyer
      if (state.ui.actionSubView === 'sellOre') {
        const max = Object.keys(state.inventory).length - 1
        const next = Math.max(0, Math.min(max, state.ui.marketIndex + delta))
        return { ...state, ui: { ...state.ui, marketIndex: next } }
      }

      if (state.ui.actionSubView === 'mineOre') {
        const max = ORE_TYPES.length - 1
        const next = Math.max(0, Math.min(max, state.ui.mineOreIndex + delta))
        return { ...state, ui: { ...state.ui, mineOreIndex: next } }
      }

      const items = getActionItems(state.location, state.mining.active)
      const next = Math.max(0, Math.min(items.length - 1, state.ui.actionIndex + delta))
      return { ...state, ui: { ...state.ui, actionIndex: next } }
    }

    case 'CONFIRM_SELECTION': {
      if (state.travel.active) return state
      const { actionIndex, actionSubView, travelIndex, marketIndex } = state.ui

      if (actionSubView === 'travel') {
        const dest = TRAVEL_DESTINATIONS[travelIndex]
        if (!dest) return state
        return reducer(state, { type: 'TRAVEL', payload: { destination: dest.id } })
      }

      // Player confirmed a slot — step into the upgrade picker for that slot
      if (actionSubView === 'equip') {
        const slot = UPGRADE_SLOTS[state.ui.equipSlotIndex]
        if (!slot) return state
        return {
          ...state,
          ui: {
            ...state.ui,
            actionSubView: 'equipSlot',
            selectedEquipSlot: slot.id,
            equipUpgradeIndex: 0,
          },
        }
      }

      // Player confirmed an upgrade (or None) to equip in the selected slot
      if (actionSubView === 'equipSlot') {
        const slot = state.ui.selectedEquipSlot
        const slotUpgrades = ALL_UPGRADES.filter(
          u => u.slot === slot && state.upgrades.includes(u.id)
        )
        // Index 0 = "None", indices 1+ = upgrades
        const upgradeId = state.ui.equipUpgradeIndex === 0
          ? null
          : slotUpgrades[state.ui.equipUpgradeIndex - 1]?.id ?? null
        return reducer(state, { type: 'EQUIP_UPGRADE', payload: { slot, upgradeId } })
      }

      // Player confirmed an upgrade in the shop — attempt to buy it
      if (actionSubView === 'shop') {
        const upgrade = ALL_UPGRADES[state.ui.shopIndex]
        if (!upgrade) return state
        return reducer(state, { type: 'BUY_UPGRADE', payload: { upgradeId: upgrade.id } })
      }

      // Player confirmed a buyer country — step into the ore-picker for that buyer
      if (actionSubView === 'sell') {
        const buyer = BUYER_COUNTRIES[state.ui.buyerIndex]
        if (!buyer) return state
        return {
          ...state,
          ui: {
            ...state.ui,
            actionSubView: 'sellOre',
            selectedBuyer: buyer.id,
            marketIndex: 0,  // reset ore cursor whenever entering ore list
          },
        }
      }

      // Player confirmed an ore — sell it at the chosen buyer's price
      if (actionSubView === 'sellOre') {
        const oreTypes = Object.keys(state.inventory)
        const oreType = oreTypes[marketIndex]
        const price = state.ui.buyerPrices?.[state.ui.selectedBuyer]?.[oreType]
        return reducer(state, { type: 'SELL_ORE', payload: { oreType, price } })
      }

      if (actionSubView === 'mineOre') {
        const oreType = ORE_TYPES[state.ui.mineOreIndex]
        const s = { ...state, ui: { ...state.ui, actionSubView: null } }
        const handler = LOCATIONS_BY_ID[state.location]?.handlers?.start_mining
        return handler ? handler(s, { oreType }) : s
      }

      const items = getActionItems(state.location, state.mining.active)
      const selected = items[actionIndex]
      if (!selected) return state

      switch (selected.id) {
        case 'mineToggle': {
          const handler = LOCATIONS_BY_ID[state.location]?.handlers?.mineToggle
          return handler ? handler(state) : state
        }
        case 'travel':
          return { ...state, ui: { ...state.ui, actionSubView: 'travel', travelIndex: 0 } }
        case 'sell':
          // Generate fresh buyer prices every time the player opens Sell
          return {
            ...state,
            ui: {
              ...state.ui,
              actionSubView: 'sell',
              buyerIndex: 0,
              buyerPrices: generateBuyerPrices(),
            },
          }
        case 'shop':
          return { ...state, ui: { ...state.ui, actionSubView: 'shop', shopIndex: 0 } }
        case 'equip':
          return { ...state, ui: { ...state.ui, actionSubView: 'equip', equipSlotIndex: 0 } }
        case 'repair':
          return reducer(state, { type: 'REPAIR_SHIP' })
        case 'refuel':
          return reducer(state, { type: 'REFUEL_SHIP' })
        default:
          return state
      }
    }

    case 'EXIT_SUBVIEW': {
      // Step back one level rather than always jumping to the main menu
      const subView = state.ui.actionSubView
      const prev = subView === 'sellOre'   ? 'sell'
                 : subView === 'equipSlot' ? 'equip'
                 : null
      return { ...state, ui: { ...state.ui, actionSubView: prev } }
    }

    case 'TRAVEL': {
      const { destination } = action.payload
      if (destination === state.location) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Already here.' })
      }
      if (state.travel.active) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Already traveling!' })
      }
      if (state.ship.fuel < TRAVEL_COST) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Not enough fuel!' })
      }
      const newFuel = state.ship.fuel - TRAVEL_COST
      const cancelMining = state.mining.active
        ? { active: false, oreType: null, progress: 0, durationMs: 0, startedAt: null, fuelAtStart: newFuel }
        : state.mining
      // Look up the human-readable label for the destination (e.g. "Main Belt")
      const destLabel = LOCATIONS_BY_ID[destination]?.label ?? destination
      const travelingState = {
        ...state,
        ship: { ...state.ship, fuel: newFuel },
        mining: cancelMining,
        travel: { active: true, destination, progress: 0, startedAt: Date.now() },
        ui: { ...state.ui, actionSubView: null, actionIndex: 0 },
      }
      return addLog(travelingState, `Departing for ${destLabel}.`)
    }

    case 'TICK_TRAVEL': {
      if (!state.travel.active) return state
      const { now } = action.payload
      const elapsed = now - state.travel.startedAt
      const progress = Math.min(1, elapsed / TRAVEL_DURATION_MS)
      if (progress >= 1) {
        return reducer(state, { type: 'COMPLETE_TRAVEL' })
      }
      return { ...state, travel: { ...state.travel, progress } }
    }

    case 'COMPLETE_TRAVEL': {
      const { destination } = state.travel
      const arrivedLabel = LOCATIONS_BY_ID[destination]?.label ?? destination
      const arrivedState = {
        ...state,
        location: destination,
        travel: { active: false, destination: null, progress: 0, startedAt: null },
      }
      return addLog(arrivedState, `Arrived at ${arrivedLabel}.`)
    }

    case 'TICK_MINING': {
      const handler = LOCATIONS_BY_ID[state.location]?.handlers?.tick_mining
      return handler ? handler(state, action.payload) : state
    }

    case 'CANCEL_MINING': {
      const handler = LOCATIONS_BY_ID[state.location]?.handlers?.cancel_mining
      return handler ? handler(state) : state
    }

    case 'SELL_ORE': {
      const handler = LOCATIONS_BY_ID[state.location]?.handlers?.sell_ore
      return handler ? handler(state, action.payload) : state
    }

    case 'REPAIR_SHIP': {
      const handler = LOCATIONS_BY_ID[state.location]?.handlers?.repair
      return handler ? handler(state) : state
    }

    case 'REFUEL_SHIP': {
      const handler = LOCATIONS_BY_ID[state.location]?.handlers?.refuel
      return handler ? handler(state) : state
    }

    case 'BUY_UPGRADE': {
      const { upgradeId } = action.payload
      const upgrade = UPGRADES_BY_ID[upgradeId]
      if (!upgrade) return state

      // Can't buy the same upgrade twice
      if (state.upgrades.includes(upgradeId)) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Already owned!' })
      }

      // Check if the player has enough money
      if (state.money < upgrade.price) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Insufficient credits!' })
      }

      // Just add to owned inventory — the player equips it manually via the Equip menu
      const purchasedState = {
        ...state,
        money:    state.money - upgrade.price,
        upgrades: [...state.upgrades, upgradeId],
        ui:       { ...state.ui, message: `${upgrade.name} purchased! Equip it from the Equip menu.` },
      }
      return addLog(purchasedState, `${upgrade.name} purchased for ${formatMoney(upgrade.price)}.`)
    }

    case 'EQUIP_UPGRADE': {
      const { slot, upgradeId } = action.payload
      // upgradeId is null when the player selects "None" (unequip)

      const currentId = state.equipped[slot]
      const currentUpgrade = currentId ? UPGRADES_BY_ID[currentId] : null
      const newUpgrade = upgradeId ? UPGRADES_BY_ID[upgradeId] : null

      // Guard: make sure the player actually owns the upgrade they're trying to equip
      if (newUpgrade && !state.upgrades.includes(upgradeId)) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'You do not own that upgrade.' })
      }

      // Build updated ship stats by unapplying the old upgrade and applying the new one
      const s = currentUpgrade?.stats ?? {}
      const n = newUpgrade?.stats   ?? {}
      const newShip = {
        ...state.ship,
        armorMax: state.ship.armorMax - (s.armorBonus ?? 0) + (n.armorBonus ?? 0),
        // Keep current armor clamped to the new max
        armor:    Math.min(state.ship.armor - (s.armorBonus ?? 0) + (n.armorBonus ?? 0),
                           state.ship.armorMax - (s.armorBonus ?? 0) + (n.armorBonus ?? 0)),
        fuelMax:  state.ship.fuelMax  - (s.fuelBonus  ?? 0) + (n.fuelBonus  ?? 0),
        fuel:     Math.min(state.ship.fuel - (s.fuelBonus ?? 0) + (n.fuelBonus ?? 0),
                           state.ship.fuelMax - (s.fuelBonus ?? 0) + (n.fuelBonus ?? 0)),
        cargoMax: state.ship.cargoMax - (s.cargoBonus ?? 0) + (n.cargoBonus ?? 0),
      }

      const flashMsg = newUpgrade ? `${newUpgrade.name} equipped!` : `${slot} slot cleared.`
      // Slightly more descriptive version for the persistent log
      const logMsg = newUpgrade
        ? `${newUpgrade.name} equipped in ${slot} slot.`
        : `${slot} slot cleared.`
      const equippedState = {
        ...state,
        ship:     newShip,
        equipped: { ...state.equipped, [slot]: upgradeId ?? null },
        ui:       { ...state.ui, message: flashMsg },
      }
      return addLog(equippedState, logMsg)
    }

    case 'SET_MESSAGE': {
      return { ...state, ui: { ...state.ui, message: action.payload } }
    }

    case 'CLEAR_MESSAGE': {
      return { ...state, ui: { ...state.ui, message: null } }
    }

    default:
      return state
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const messageTimerRef = useRef(null)

  const dispatchWrapped = useCallback((action) => dispatch(action), [])

  useEffect(() => {
    if (state.ui.message) {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
      messageTimerRef.current = setTimeout(() => dispatch({ type: 'CLEAR_MESSAGE' }), 3000)
    }
    return () => { if (messageTimerRef.current) clearTimeout(messageTimerRef.current) }
  }, [state.ui.message])

  useEffect(() => {
    if (!state.mining.active) return
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_MINING', payload: { now: Date.now() } })
    }, MINING_TICK_MS)
    return () => clearInterval(interval)
  }, [state.mining.active, state.mining.startedAt])

  useEffect(() => {
    if (!state.travel.active) return
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_TRAVEL', payload: { now: Date.now() } })
    }, TRAVEL_TICK_MS)
    return () => clearInterval(interval)
  }, [state.travel.active, state.travel.startedAt])

  return { state, dispatch: dispatchWrapped }
}
