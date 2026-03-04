import Panel from './Panel'
import { LOCATION_OPTIONS } from '../constants/locations'
import { MARKET_PRICES } from '../constants/ores'

function MarketView({ inventory, marketIndex, focused }) {
  const oreTypes = Object.keys(inventory)
  return (
    <div className="market-view">
      <div className="market-header">-- MARKET --</div>
      <div className="market-cols">
        <span className="market-col-hdr">ORE</span>
        <span className="market-col-hdr">PRICE/KG</span>
        <span className="market-col-hdr">QTY</span>
        <span className="market-col-hdr">VALUE</span>
      </div>
      {oreTypes.map((ore, i) => {
        const qty = inventory[ore]
        const price = MARKET_PRICES[ore]
        const value = qty * price
        const isSelected = i === marketIndex
        const isActive = focused && isSelected
        return (
          <div
            key={ore}
            className={`market-row${isActive ? ' selected' : ''}${qty === 0 ? ' dim' : ''}`}
          >
            <span className="market-ore">{isActive ? '>' : ' '} {ore.toUpperCase().padEnd(6)}</span>
            <span className="market-price">${price}/kg</span>
            <span className="market-qty">{qty} kg</span>
            <span className="market-val">${value.toLocaleString()}</span>
          </div>
        )
      })}
      <div className="market-hint">[ESC] Back</div>
    </div>
  )
}

export default function LocationOptions({ focused, location, locationOptionsIndex, subView, marketIndex, inventory }) {
  const opts = LOCATION_OPTIONS[location] || []

  if (subView === 'market') {
    return (
      <Panel title="LOCATION" focused={focused}>
        <MarketView inventory={inventory} marketIndex={marketIndex} focused={focused} />
      </Panel>
    )
  }

  return (
    <Panel title="LOCATION" focused={focused}>
      {opts.map((opt, i) => {
        const isSelected = focused && i === locationOptionsIndex
        return (
          <div key={opt} className={`list-row${isSelected ? ' selected' : ''}`}>
            {isSelected ? '> ' : '  '}
            {opt}
          </div>
        )
      })}
    </Panel>
  )
}
