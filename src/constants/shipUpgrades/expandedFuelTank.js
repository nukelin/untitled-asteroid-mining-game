export default {
  id: 'expanded_fuel_tank',
  name: 'Expanded Fuel Tank',
  slot: 'engine',
  price: 4000000,       // $4,000,000
  description: '+50 max fuel',

  stats: {
    armorBonus: 0,
    fuelBonus: 50,      // added to ship.fuelMax (and current fuel)
    cargoBonus: 0,
    miningYieldBonus: 0,
    miningSpeedBonus: 0,
    miningFuelEfficiency: 0,
  },
}
