import { useReducer, useEffect, useRef, useCallback } from 'react'
import {
  TRAVEL_COST,
  REPAIR_COST_PER_HP,
  REFUEL_COST_PER_UNIT,
  MINING_TICK_MS,
  MINING_DURATION_MIN,
  MINING_DURATION_MAX,
  MINING_YIELD_MIN,
  MINING_YIELD_MAX,
  MINING_FUEL_DRAIN_PER_SECOND,
  LOCATION_OPTIONS,
  TRAVEL_DESTINATIONS,
  pickWeightedOre,
} from '../constants/gameConstants'
import { MARKET_PRICES } from '../constants/marketPrices'

const initialState = {
  ship: {
    armor: 100,
    armorMax: 100,
    fuel: 100,
    fuelMax: 100,
    cargoUsed: 0,
    cargoMax: 500,
  },
  money: 1000,
  inventory: { iron: 0, nickel: 0, cobalt: 0, gold: 0 },
  location: 'earth',
  mining: {
    active: false,
    oreType: null,
    progress: 0,
    durationMs: 0,
    startedAt: null,
    fuelAtStart: 100,
  },
  ui: {
    focusedPanel: 'travel',
    travelIndex: 0,
    locationOptionsIndex: 0,
    subView: null,
    marketIndex: 0,
    message: null,
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'FOCUS_PANEL': {
      return {
        ...state,
        ui: { ...state.ui, focusedPanel: action.payload },
      }
    }

    case 'MOVE_SELECTION': {
      const { panel, direction } = action.payload
      const delta = direction === 'up' ? -1 : 1

      if (panel === 'travel') {
        const max = TRAVEL_DESTINATIONS.length - 1
        const next = Math.max(0, Math.min(max, state.ui.travelIndex + delta))
        return { ...state, ui: { ...state.ui, travelIndex: next } }
      }

      if (panel === 'locationOptions') {
        if (state.ui.subView === 'market') {
          const oreTypes = Object.keys(state.inventory)
          const max = oreTypes.length - 1
          const next = Math.max(0, Math.min(max, state.ui.marketIndex + delta))
          return { ...state, ui: { ...state.ui, marketIndex: next } }
        }
        const opts = LOCATION_OPTIONS[state.location] || []
        const max = opts.length - 1
        const next = Math.max(0, Math.min(max, state.ui.locationOptionsIndex + delta))
        return { ...state, ui: { ...state.ui, locationOptionsIndex: next } }
      }

      return state
    }

    case 'CONFIRM_SELECTION': {
      const { focusedPanel, travelIndex, locationOptionsIndex, subView, marketIndex } = state.ui

      if (focusedPanel === 'travel') {
        const dest = TRAVEL_DESTINATIONS[travelIndex]
        if (!dest) return state
        return reducer(state, { type: 'TRAVEL', payload: { destination: dest.id } })
      }

      if (focusedPanel === 'locationOptions') {
        if (subView === 'market') {
          const oreTypes = Object.keys(state.inventory)
          const oreType = oreTypes[marketIndex]
          return reducer(state, { type: 'SELL_ORE', payload: { oreType } })
        }

        const opts = LOCATION_OPTIONS[state.location] || []
        const selected = opts[locationOptionsIndex]

        if (state.location === 'earth') {
          if (selected === 'Market') return reducer(state, { type: 'OPEN_MARKET' })
          if (selected === 'Repair') return reducer(state, { type: 'REPAIR_SHIP' })
          if (selected === 'Refuel') return reducer(state, { type: 'REFUEL_SHIP' })
        }

        if (state.location === 'mainBelt') {
          if (selected === 'Mine') return reducer(state, { type: 'START_MINING' })
          if (selected === 'Leave') return reducer(state, { type: 'TRAVEL', payload: { destination: 'earth' } })
        }
      }

      return state
    }

    case 'EXIT_SUBVIEW': {
      return { ...state, ui: { ...state.ui, subView: null, marketIndex: 0 } }
    }

    case 'TRAVEL': {
      const { destination } = action.payload
      if (destination === state.location) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Already here.' })
      }
      if (state.ship.fuel < TRAVEL_COST) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Not enough fuel!' })
      }
      const newFuel = state.ship.fuel - TRAVEL_COST
      const cancelMining = state.mining.active
        ? { active: false, oreType: null, progress: 0, durationMs: 0, startedAt: null, fuelAtStart: newFuel }
        : state.mining
      return {
        ...state,
        ship: { ...state.ship, fuel: newFuel },
        location: destination,
        mining: cancelMining,
        ui: { ...state.ui, subView: null, locationOptionsIndex: 0 },
      }
    }

    case 'START_MINING': {
      if (state.ship.cargoUsed >= state.ship.cargoMax) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Cargo hold full!' })
      }
      if (state.mining.active) return state
      const oreType = pickWeightedOre()
      const durationMs =
        MINING_DURATION_MIN +
        Math.random() * (MINING_DURATION_MAX - MINING_DURATION_MIN)
      return {
        ...state,
        mining: {
          active: true,
          oreType,
          progress: 0,
          durationMs,
          startedAt: Date.now(),
          fuelAtStart: state.ship.fuel,
        },
      }
    }

    case 'TICK_MINING': {
      if (!state.mining.active) return state
      const { now } = action.payload
      const elapsed = now - state.mining.startedAt
      const progress = Math.min(1, elapsed / state.mining.durationMs)

      const fuelDrained = (elapsed / 1000) * MINING_FUEL_DRAIN_PER_SECOND
      const newFuel = Math.max(0, state.mining.fuelAtStart - fuelDrained)

      if (newFuel <= 0) {
        return reducer(
          { ...state, ship: { ...state.ship, fuel: 0 } },
          { type: 'CANCEL_MINING' }
        )
      }

      if (progress >= 1) {
        return reducer(
          { ...state, ship: { ...state.ship, fuel: newFuel } },
          { type: 'COMPLETE_MINING' }
        )
      }

      return {
        ...state,
        ship: { ...state.ship, fuel: newFuel },
        mining: { ...state.mining, progress },
      }
    }

    case 'COMPLETE_MINING': {
      const freeSpace = state.ship.cargoMax - state.ship.cargoUsed
      if (freeSpace <= 0) {
        return reducer(state, { type: 'CANCEL_MINING' })
      }
      const rawYield = MINING_YIELD_MIN + Math.random() * (MINING_YIELD_MAX - MINING_YIELD_MIN)
      const yieldKg = Math.round(Math.min(rawYield, freeSpace))
      const oreType = state.mining.oreType
      return {
        ...state,
        inventory: {
          ...state.inventory,
          [oreType]: state.inventory[oreType] + yieldKg,
        },
        ship: {
          ...state.ship,
          cargoUsed: state.ship.cargoUsed + yieldKg,
        },
        mining: {
          active: false,
          oreType: null,
          progress: 0,
          durationMs: 0,
          startedAt: null,
          fuelAtStart: state.ship.fuel,
        },
      }
    }

    case 'CANCEL_MINING': {
      return {
        ...state,
        mining: {
          active: false,
          oreType: null,
          progress: 0,
          durationMs: 0,
          startedAt: null,
          fuelAtStart: state.ship.fuel,
        },
      }
    }

    case 'OPEN_MARKET': {
      return { ...state, ui: { ...state.ui, subView: 'market', marketIndex: 0 } }
    }

    case 'SELL_ORE': {
      const { oreType } = action.payload
      const qty = state.inventory[oreType]
      if (!qty || qty <= 0) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Nothing to sell!' })
      }
      const price = MARKET_PRICES[oreType] || 0
      const earnings = qty * price
      return {
        ...state,
        money: state.money + earnings,
        inventory: { ...state.inventory, [oreType]: 0 },
        ship: { ...state.ship, cargoUsed: state.ship.cargoUsed - qty },
      }
    }

    case 'REPAIR_SHIP': {
      const hpMissing = state.ship.armorMax - state.ship.armor
      if (hpMissing <= 0) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Hull is fully intact.' })
      }
      const cost = hpMissing * REPAIR_COST_PER_HP
      if (state.money < cost) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Insufficient credits!' })
      }
      return {
        ...state,
        money: state.money - cost,
        ship: { ...state.ship, armor: state.ship.armorMax },
      }
    }

    case 'REFUEL_SHIP': {
      const fuelMissing = state.ship.fuelMax - state.ship.fuel
      if (fuelMissing <= 0) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Tank is full.' })
      }
      const cost = fuelMissing * REFUEL_COST_PER_UNIT
      if (state.money < cost) {
        return reducer(state, { type: 'SET_MESSAGE', payload: 'Insufficient credits!' })
      }
      return {
        ...state,
        money: state.money - cost,
        ship: { ...state.ship, fuel: state.ship.fuelMax },
      }
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

  const dispatchWithMessage = useCallback(
    (action) => {
      dispatch(action)
    },
    []
  )

  // Auto-clear messages after 3s
  useEffect(() => {
    if (state.ui.message) {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
      messageTimerRef.current = setTimeout(() => {
        dispatch({ type: 'CLEAR_MESSAGE' })
      }, 3000)
    }
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
    }
  }, [state.ui.message])

  // Mining tick
  useEffect(() => {
    if (!state.mining.active) return
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_MINING', payload: { now: Date.now() } })
    }, MINING_TICK_MS)
    return () => clearInterval(interval)
  }, [state.mining.active, state.mining.startedAt])

  return { state, dispatch: dispatchWithMessage }
}
