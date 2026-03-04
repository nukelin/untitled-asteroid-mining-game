import templateShip from './templateShip'

// All available ships. Add new ship imports here.
const ALL_SHIPS = [templateShip]

export default ALL_SHIPS
export const SHIPS_BY_ID = Object.fromEntries(ALL_SHIPS.map(s => [s.id, s]))
