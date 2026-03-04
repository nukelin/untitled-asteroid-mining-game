export default {
  id: 'armor_plating',
  name: 'Armor Plating',
  slot: 'armor',
  price: 5000000,       // $5,000,000
  description: '+50 max armor',

  stats: {
    armorBonus: 50,     // added to ship.armorMax (and current armor)
    fuelBonus: 0,
    cargoBonus: 0,
    miningYieldBonus: 0,
    miningSpeedBonus: 0,
    miningFuelEfficiency: 0,
  },
}
