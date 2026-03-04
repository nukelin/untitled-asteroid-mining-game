import Panel from './Panel'
import { TRAVEL_DESTINATIONS } from '../constants/gameConstants'

export default function Travel({ focused, location, travelIndex }) {
  return (
    <Panel title="TRAVEL" focused={focused}>
      {TRAVEL_DESTINATIONS.map((dest, i) => {
        const isCurrent = dest.id === location
        const isSelected = i === travelIndex
        const isActive = focused && isSelected
        return (
          <div
            key={dest.id}
            className={`list-row${isActive ? ' selected' : ''}${isCurrent ? ' current-loc' : ''}`}
          >
            {isActive ? '> ' : '  '}
            {dest.label}
            {isCurrent ? ' *' : ''}
          </div>
        )
      })}
    </Panel>
  )
}
