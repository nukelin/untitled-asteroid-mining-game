import { useReducer, useEffect, useRef, useCallback } from 'react'
import { TRAVEL_COST, TRAVEL_DURATION_MS, TRAVEL_TICK_MS } from '../constants/travel'
import { MINING_TICK_MS } from '../constants/mining'
import { TRAVEL_DESTINATIONS, LOCATIONS_BY_ID } from '../constants/locations'
import { ORE_TYPES } from '../constants/ores'
import { getActionItems } from '../constants/utils'

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
  travel: {
    active: false,
    destination: null,
    progress: 0,
    startedAt: null,
  },
  ui: {
    actionIndex: 0,
    actionSubView: null,  // null | 'travel' | 'market' | 'mineOre'
    travelIndex: 0,
    marketIndex: 0,
    mineOreIndex: 0,
    message: null,
  },
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

      if (state.ui.actionSubView === 'market') {
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

      if (actionSubView === 'market') {
        const oreTypes = Object.keys(state.inventory)
        const oreType = oreTypes[marketIndex]
        return reducer(state, { type: 'SELL_ORE', payload: { oreType } })
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
        case 'market':
          return { ...state, ui: { ...state.ui, actionSubView: 'market', marketIndex: 0 } }
        case 'repair':
          return reducer(state, { type: 'REPAIR_SHIP' })
        case 'refuel':
          return reducer(state, { type: 'REFUEL_SHIP' })
        default:
          return state
      }
    }

    case 'EXIT_SUBVIEW': {
      return { ...state, ui: { ...state.ui, actionSubView: null } }
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
      return {
        ...state,
        ship: { ...state.ship, fuel: newFuel },
        mining: cancelMining,
        travel: { active: true, destination, progress: 0, startedAt: Date.now() },
        ui: { ...state.ui, actionSubView: null, actionIndex: 0 },
      }
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
      return {
        ...state,
        location: destination,
        travel: { active: false, destination: null, progress: 0, startedAt: null },
      }
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
