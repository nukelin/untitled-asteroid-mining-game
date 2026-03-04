import armorPlating from './armorPlating'
import expandedFuelTank from './expandedFuelTank'
import cargoBay from './cargoBay'
import miningDrill from './miningDrill'

// All available ship upgrades. Add new upgrade imports here.
const ALL_UPGRADES = [armorPlating, expandedFuelTank, cargoBay, miningDrill]

export default ALL_UPGRADES
export const UPGRADES_BY_ID = Object.fromEntries(ALL_UPGRADES.map(u => [u.id, u]))
