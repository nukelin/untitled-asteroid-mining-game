export default {
  id: 'template_upgrade',   // unique identifier (snake_case)
  name: 'Template Upgrade', // display name shown in market
  slot: 'misc',             // upgrade category — edit to match the ship's slot type
  price: 0,                 // credits to buy at market

  // All values add directly to the ship's current stats when equipped.
  stats: {
    armorBonus: 0,            // added to ship.armorMax (hull HP)
    fuelBonus: 0,             // added to ship.fuelMax
    cargoBonus: 0,            // added to ship.cargoMax (kg)
    miningYieldBonus: 0,      // added to mining yield multiplier
    miningSpeedBonus: 0,      // subtracted from mining duration multiplier (faster = lower)
    miningFuelEfficiency: 0,  // subtracted from fuel drain per second while mining
  },
}
