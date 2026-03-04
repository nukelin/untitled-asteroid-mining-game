import Panel from './Panel'
import { TRAVEL_DESTINATIONS } from '../constants/locations'
import { ORE_TYPES, ORE_WEIGHTS, MARKET_PRICES } from '../constants/ores'
import { getActionItems } from '../constants/utils'

function TravelView({ travelIndex, location }) {
  return (
    <div>
      <div className="action-subheader">-- Travel --</div>
      {TRAVEL_DESTINATIONS.map((dest, i) => {
        const isCurrent = dest.id === location
        const isSelected = i === travelIndex
        return (
          <div key={dest.id} className={`list-row${isSelected ? ' selected' : ''}${isCurrent ? ' current-loc' : ''}`}>
            {isSelected ? '> ' : '  '}{dest.label}{isCurrent ? ' *' : ''}
          </div>
        )
      })}
      <div className="action-hint">[ESC] Back</div>
    </div>
  )
}

function MarketView({ inventory, marketIndex }) {
  const oreTypes = Object.keys(inventory)
  return (
    <div>
      <div className="action-subheader">-- Market --</div>
      <div className="market-cols">
        <span>ORE</span><span>$/KG</span><span>QTY</span><span>VALUE</span>
      </div>
      {oreTypes.map((ore, i) => {
        const qty = inventory[ore]
        const price = MARKET_PRICES[ore]
        const isSelected = i === marketIndex
        return (
          <div key={ore} className={`market-row${isSelected ? ' selected' : ''}${qty === 0 ? ' dim' : ''}`}>
            <span>{isSelected ? '>' : ' '} {ore.toUpperCase().padEnd(6)}</span>
            <span>${price}/kg</span>
            <span>{qty} kg</span>
            <span>${(qty * price).toLocaleString()}</span>
          </div>
        )
      })}
      <div className="action-hint">[ESC] Back</div>
    </div>
  )
}

function OreSelectView({ mineOreIndex }) {
  const totalWeight = Object.values(ORE_WEIGHTS).reduce((a, b) => a + b, 0)
  return (
    <div>
      <div className="action-subheader">-- Select Ore --</div>
      {ORE_TYPES.map((ore, i) => {
        const isSelected = i === mineOreIndex
        const chance = Math.round((ORE_WEIGHTS[ore] / totalWeight) * 100)
        return (
          <div key={ore} className={`list-row${isSelected ? ' selected' : ''}`}>
            {isSelected ? '> ' : '  '}{ore.toUpperCase().padEnd(8)} {chance}% abundance
          </div>
        )
      })}
      <div className="action-hint">[ESC] Back</div>
    </div>
  )
}

export default function ActionBox({ location, mining, travel, actionIndex, actionSubView, travelIndex, marketIndex, mineOreIndex, inventory }) {
  if (travel.active) {
    return (
      <Panel title="ACTIONS">
        <div className="action-hint">Traveling...</div>
      </Panel>
    )
  }

  if (actionSubView === 'travel') {
    return (
      <Panel title="ACTIONS">
        <TravelView travelIndex={travelIndex} location={location} />
      </Panel>
    )
  }

  if (actionSubView === 'market') {
    return (
      <Panel title="ACTIONS">
        <MarketView inventory={inventory} marketIndex={marketIndex} />
      </Panel>
    )
  }

  if (actionSubView === 'mineOre') {
    return (
      <Panel title="ACTIONS">
        <OreSelectView mineOreIndex={mineOreIndex} />
      </Panel>
    )
  }

  const items = getActionItems(location, mining.active)
  return (
    <Panel title="ACTIONS">
      {items.map((item, i) => {
        const isSelected = i === actionIndex
        return (
          <div key={item.id} className={`list-row${isSelected ? ' selected' : ''}`}>
            {isSelected ? '> ' : '  '}{item.label}
          </div>
        )
      })}
    </Panel>
  )
}
