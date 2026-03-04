import Panel from './Panel'
import { renderBar } from '../constants/gameConstants'

export default function MiningStatus({ mining }) {
  return (
    <Panel title="MINING">
      <div className="mining-label">Currently Mining:</div>
      {mining.active ? (
        <>
          <div className="mining-ore">{mining.oreType?.toUpperCase()}</div>
          <div className="mining-bar">
            {renderBar(mining.progress, 1, 14)}
            <span className="mining-pct"> {Math.round(mining.progress * 100)}%</span>
          </div>
        </>
      ) : (
        <div className="mining-none">-- NONE --</div>
      )}
    </Panel>
  )
}
