import Panel from './Panel'
import { renderBar } from '../constants/utils'
import { LOCATIONS_BY_ID } from '../constants/locations'

export default function StatusBar({ location, mining, travel, message }) {
  return (
    <Panel title="STATUS">
      <div className="status-row">
        <span className="status-label">Location:</span>
        <span className="status-value">{LOCATIONS_BY_ID[location]?.label ?? location}</span>
        <span className="status-sep">|</span>
        <span className="status-label">Mining:</span>
        {mining.active ? (
          <span className="status-value">
            {mining.oreType?.toUpperCase()} {renderBar(mining.progress, 1, 12)} {Math.round(mining.progress * 100)}%
          </span>
        ) : (
          <span className="status-dim">IDLE</span>
        )}
        <span className="status-sep">|</span>
        <span className="status-label">Travel:</span>
        {travel.active ? (
          <span className="status-value">
            {LOCATIONS_BY_ID[travel.destination]?.label ?? travel.destination} {renderBar(travel.progress, 1, 12)} {Math.round(travel.progress * 100)}%
          </span>
        ) : (
          <span className="status-dim">IN DOCK</span>
        )}
        {message && <><span className="status-sep">|</span><span className="status-message">{message}</span></>}
      </div>
    </Panel>
  )
}
