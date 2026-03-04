import Panel from './Panel'
import { renderBar } from '../constants/gameConstants'

export default function ShipStatus({ ship }) {
  return (
    <Panel title="SHIP STATUS">
      <div className="stat-row">
        <span className="stat-label">ARMOR</span>
        <span className="stat-bar">{renderBar(ship.armor, ship.armorMax)}</span>
        <span className="stat-value">{Math.round(ship.armor)}/{ship.armorMax}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">FUEL </span>
        <span className="stat-bar">{renderBar(ship.fuel, ship.fuelMax)}</span>
        <span className="stat-value">{Math.round(ship.fuel)}/{ship.fuelMax}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">CARGO</span>
        <span className="stat-bar">{renderBar(ship.cargoUsed, ship.cargoMax)}</span>
        <span className="stat-value">{ship.cargoUsed}/{ship.cargoMax}</span>
      </div>
    </Panel>
  )
}
