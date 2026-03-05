import Panel from './Panel'
import { TRAVEL_DESTINATIONS } from '../constants/locations'
import { ORE_TYPES, ORE_WEIGHTS } from '../constants/ores'
import { BUYER_COUNTRIES } from '../constants/buyers'
import ALL_UPGRADES, { UPGRADE_SLOTS } from '../constants/shipUpgrades'
import { getActionItems, formatMoney } from '../constants/utils'

// ─── TravelView ───────────────────────────────────────────────────────────────
// Shows a list of destinations the player can travel to.
// The last item in the list is always "Back", which returns to the main menu.
function TravelView({ travelIndex, location }) {
  // "Back" lives one index past the last destination
  const backIndex = TRAVEL_DESTINATIONS.length
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
      {/* Selectable Back option — highlighted when the cursor reaches this index */}
      <div className={`list-row${travelIndex === backIndex ? ' selected' : ''}`}>
        {travelIndex === backIndex ? '> ' : '  '}Back
      </div>
    </div>
  )
}

// ─── BuyerSelectView ──────────────────────────────────────────────────────────
// First screen of the Sell flow: shows a simple list of buyer countries.
// The last item is always "Back", which returns to the main menu.
function BuyerSelectView({ buyerIndex }) {
  // "Back" lives one index past the last buyer
  const backIndex = BUYER_COUNTRIES.length
  return (
    <div>
      <div className="action-subheader">-- Sell --</div>
      <div className="market-hint">Who do you want to sell to?</div>

      {BUYER_COUNTRIES.map((buyer, i) => {
        const isSelected = i === buyerIndex
        return (
          <div key={buyer.id} className={`list-row${isSelected ? ' selected' : ''}`}>
            {isSelected ? '> ' : '  '}{buyer.label}
          </div>
        )
      })}

      {/* Selectable Back option */}
      <div className={`list-row${buyerIndex === backIndex ? ' selected' : ''}`}>
        {buyerIndex === backIndex ? '> ' : '  '}Back
      </div>
    </div>
  )
}

// ─── SellOreView ──────────────────────────────────────────────────────────────
// Second screen of the Sell flow: shows the player's ore inventory with prices
// specific to the buyer country they selected in BuyerSelectView.
function SellOreView({ inventory, marketIndex, buyerPrices, selectedBuyer, buyerLabel }) {
  const oreTypes = Object.keys(inventory)
  // Pull this buyer's price table; fall back to empty object if somehow missing
  const prices = buyerPrices?.[selectedBuyer] ?? {}

  return (
    <div>
      {/* Header names the specific buyer the player chose */}
      <div className="action-subheader">-- Sell to {buyerLabel} --</div>
      <div className="market-cols">
        <span>ORE</span><span>$/KG</span><span>QTY</span><span>VALUE</span>
      </div>
      {oreTypes.map((ore, i) => {
        const qty = inventory[ore]
        const price = prices[ore] ?? 0
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
      {/* Selectable Back option — one index past the last ore */}
      <div className={`list-row${marketIndex === oreTypes.length ? ' selected' : ''}`}>
        {marketIndex === oreTypes.length ? '> ' : '  '}Back
      </div>
    </div>
  )
}

// ─── EquipSlotsView ───────────────────────────────────────────────────────────
// First screen of the Equip flow: shows all four ship slots and what's currently
// equipped in each one.
function EquipSlotsView({ equipSlotIndex, equipped, upgrades }) {
  return (
    <div>
      <div className="action-subheader">-- Equip --</div>
      <div className="equip-header-row">
        <span>SLOT</span>
        <span>EQUIPPED</span>
      </div>
      {UPGRADE_SLOTS.map((slot, i) => {
        const isSelected = i === equipSlotIndex
        const equippedId = equipped[slot.id]
        // Find the upgrade object for what's equipped, if anything
        const equippedUpgrade = equippedId
          ? ALL_UPGRADES.find(u => u.id === equippedId)
          : null
        // Count how many owned upgrades fit this slot (so player knows if there's anything to pick)
        const availableCount = ALL_UPGRADES.filter(u => u.slot === slot.id && upgrades.includes(u.id)).length
        return (
          <div key={slot.id} className={`equip-row${isSelected ? ' selected' : ''}`}>
            <span>{isSelected ? '>' : ' '} {slot.label}</span>
            <span>{equippedUpgrade ? equippedUpgrade.name : <span className="status-dim">Empty</span>}</span>
            <span className="status-dim">{availableCount > 0 ? `(${availableCount} owned)` : ''}</span>
          </div>
        )
      })}
      {/* Selectable Back option — one index past the last slot */}
      <div className={`equip-row${equipSlotIndex === UPGRADE_SLOTS.length ? ' selected' : ''}`}>
        <span>{equipSlotIndex === UPGRADE_SLOTS.length ? '>' : ' '} Back</span>
      </div>
    </div>
  )
}

// ─── EquipUpgradeView ─────────────────────────────────────────────────────────
// Second screen of the Equip flow: shows owned upgrades for the chosen slot plus
// a "None" option to clear the slot.
function EquipUpgradeView({ equipUpgradeIndex, equipped, upgrades, selectedSlot }) {
  const slot = UPGRADE_SLOTS.find(s => s.id === selectedSlot)
  const slotLabel = slot?.label ?? selectedSlot

  // All owned upgrades that belong to this slot
  const slotUpgrades = ALL_UPGRADES.filter(u => u.slot === selectedSlot && upgrades.includes(u.id))

  // Build the option list: "None" is always first
  const options = [
    { id: null, name: 'None', description: 'Clear this slot' },
    ...slotUpgrades,
  ]

  const equippedId = equipped[selectedSlot]

  return (
    <div>
      <div className="action-subheader">-- {slotLabel} Slot --</div>
      {options.map((opt, i) => {
        const isSelected = i === equipUpgradeIndex
        const isEquipped = opt.id === equippedId
        return (
          <div key={opt.id ?? 'none'} className={`equip-row${isSelected ? ' selected' : ''}`}>
            <span>{isSelected ? '>' : ' '} {opt.name}</span>
            <span className="status-dim">{opt.description ?? ''}</span>
            {isEquipped && <span className="equip-active">[EQUIPPED]</span>}
          </div>
        )
      })}
      {slotUpgrades.length === 0 && (
        <div className="status-dim" style={{ paddingLeft: '2ch', fontSize: '0.8rem' }}>
          No upgrades owned for this slot.
        </div>
      )}
      {/* Selectable Back option — one index past the last option (None + upgrades) */}
      <div className={`equip-row${equipUpgradeIndex === options.length ? ' selected' : ''}`}>
        <span>{equipUpgradeIndex === options.length ? '>' : ' '} Back</span>
      </div>
    </div>
  )
}

// ─── ShopView ─────────────────────────────────────────────────────────────────
// Shows the upgrade shop. Each row displays the upgrade name, description,
// price, and whether the player already owns it.
function ShopView({ shopIndex, upgrades, money }) {
  return (
    <div>
      <div className="action-subheader">-- Upgrade Shop --</div>
      <div className="shop-header-row">
        <span>UPGRADE</span>
        <span>EFFECT</span>
        <span>PRICE</span>
      </div>
      {ALL_UPGRADES.map((upgrade, i) => {
        const isSelected = i === shopIndex
        const owned = upgrades.includes(upgrade.id)
        const canAfford = money >= upgrade.price
        // Dim the row if already owned or too expensive
        const dimClass = owned || !canAfford ? ' dim' : ''
        return (
          <div key={upgrade.id} className={`shop-row${isSelected ? ' selected' : ''}${dimClass}`}>
            <span>{isSelected ? '>' : ' '} {upgrade.name}</span>
            <span>{upgrade.description}</span>
            <span>{owned ? '[OWNED]' : formatMoney(upgrade.price)}</span>
          </div>
        )
      })}
      {/* Selectable Back option — one index past the last upgrade */}
      <div className={`list-row${shopIndex === ALL_UPGRADES.length ? ' selected' : ''}`}>
        {shopIndex === ALL_UPGRADES.length ? '> ' : '  '}Back
      </div>
    </div>
  )
}

// ─── OreSelectView ────────────────────────────────────────────────────────────
// Mining ore picker: lets the player choose which ore type to target when mining.
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
      {/* Selectable Back option — one index past the last ore type */}
      <div className={`list-row${mineOreIndex === ORE_TYPES.length ? ' selected' : ''}`}>
        {mineOreIndex === ORE_TYPES.length ? '> ' : '  '}Back
      </div>
    </div>
  )
}

// ─── ActionBox ────────────────────────────────────────────────────────────────
// The main action panel. Switches between the main action list and various
// sub-views depending on actionSubView.
export default function ActionBox({
  location, mining, travel,
  actionIndex, actionSubView,
  travelIndex, marketIndex, mineOreIndex,
  buyerIndex, buyerPrices, selectedBuyer,
  shopIndex, upgrades, money,
  equipSlotIndex, equipUpgradeIndex, selectedEquipSlot, equipped,
  inventory,
}) {
  // While traveling, the action panel is replaced by a simple status message
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

  if (actionSubView === 'equip') {
    return (
      <Panel title="ACTIONS">
        <EquipSlotsView equipSlotIndex={equipSlotIndex} equipped={equipped} upgrades={upgrades} />
      </Panel>
    )
  }

  if (actionSubView === 'equipSlot') {
    return (
      <Panel title="ACTIONS">
        <EquipUpgradeView
          equipUpgradeIndex={equipUpgradeIndex}
          equipped={equipped}
          upgrades={upgrades}
          selectedSlot={selectedEquipSlot}
        />
      </Panel>
    )
  }

  if (actionSubView === 'shop') {
    return (
      <Panel title="ACTIONS">
        <ShopView shopIndex={shopIndex} upgrades={upgrades} money={money} />
      </Panel>
    )
  }

  // First sell screen: choose a buyer country
  if (actionSubView === 'sell') {
    return (
      <Panel title="ACTIONS">
        <BuyerSelectView buyerIndex={buyerIndex} />
      </Panel>
    )
  }

  // Second sell screen: choose an ore to sell at the selected buyer's price
  if (actionSubView === 'sellOre') {
    // Look up the human-readable label for the selected buyer
    const buyer = BUYER_COUNTRIES.find(b => b.id === selectedBuyer)
    const buyerLabel = buyer?.label ?? selectedBuyer
    return (
      <Panel title="ACTIONS">
        <SellOreView
          inventory={inventory}
          marketIndex={marketIndex}
          buyerPrices={buyerPrices}
          selectedBuyer={selectedBuyer}
          buyerLabel={buyerLabel}
        />
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

  // Default: main action list for the current location
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
