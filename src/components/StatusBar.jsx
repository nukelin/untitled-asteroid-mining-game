import Panel from './Panel'
import { renderBar } from '../constants/gameConstants'

const LOCATION_LABELS = { earth: 'Earth', mainBelt: 'Main Belt' }

export default function StatusBar({ location, mining, message }) {
  return (
    <Panel title="STATUS">
      <div className="status-row">
        <span className="status-label">Location:</span>
        <span className="status-value">{LOCATION_LABELS[location] ?? location}</span>
        <span className="status-sep">|</span>
        <span className="status-label">Mining:</span>
        {mining.active ? (
          <span className="status-value">
            {mining.oreType?.toUpperCase()} {renderBar(mining.progress, 1, 12)} {Math.round(mining.progress * 100)}%
          </span>
        ) : (
          <span className="status-dim">IDLE</span>
        )}
        {message && <><span className="status-sep">|</span><span className="status-message">{message}</span></>}
      </div>
    </Panel>
  )
}
