import Panel from './Panel'
import { renderBar, formatMoney } from '../constants/utils'
import { LOCATIONS_BY_ID } from '../constants/locations'

export default function StatusBar({ location, mining, travel, ship, money, inventory, message }) {
  return (
    <Panel title="STATUS">
      {/* ── Ship stats row ─────────────────────────────────────────────────── */}
      <div className="status-row">
        <span className="status-label">ARMOR</span>
        <span className="status-value">{renderBar(ship.armor, ship.armorMax)}</span>
        <span className="status-dim">{Math.round(ship.armor)}/{ship.armorMax}</span>
        <span className="status-sep">|</span>
        <span className="status-label">FUEL</span>
        <span className="status-value">{renderBar(ship.fuel, ship.fuelMax)}</span>
        <span className="status-dim">{Math.round(ship.fuel)}/{ship.fuelMax}</span>
        <span className="status-sep">|</span>
        <span className="status-label">CARGO</span>
        <span className="status-value">{renderBar(ship.cargoUsed, ship.cargoMax)}</span>
        <span className="status-dim">{ship.cargoUsed}/{ship.cargoMax}</span>
        <span className="status-sep">|</span>
        <span className="status-label">BALANCE</span>
        <span className="status-value">{formatMoney(money)}</span>
      </div>

      {/* ── Location / activity row ────────────────────────────────────────── */}
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

      {/* ── Inventory row ──────────────────────────────────────────────────── */}
      <div className="status-row">
        <span className="status-label">Inventory:</span>
        {Object.entries(inventory).map(([ore, qty], i) => (
          <span key={ore} className="status-value">
            {i > 0 && <span className="status-sep"> · </span>}
            {ore.toUpperCase()} <span className={qty === 0 ? 'status-dim' : ''}>{qty}kg</span>
          </span>
        ))}
      </div>
    </Panel>
  )
}
