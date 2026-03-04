import earth from './earth'
import mainBelt from './mainBelt'

// All available locations. Add new location imports here.
const ALL_LOCATIONS = [earth, mainBelt]

export default ALL_LOCATIONS
export const LOCATIONS_BY_ID = Object.fromEntries(ALL_LOCATIONS.map(l => [l.id, l]))

// Derived exports — consumed by existing components, stay in sync automatically.
export const TRAVEL_DESTINATIONS = ALL_LOCATIONS.map(l => ({ id: l.id, label: l.label }))
export const LOCATION_OPTIONS = Object.fromEntries(
  ALL_LOCATIONS.map(l => [l.id, l.actions.map(a => a.label)])
)
