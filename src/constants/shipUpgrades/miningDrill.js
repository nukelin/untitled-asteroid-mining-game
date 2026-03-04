export default {
  id: 'mining_drill',
  name: 'Mining Drill',
  slot: 'mining',
  price: 25000000,          // $25,000,000
  description: '+25% yield, +20% speed',

  stats: {
    armorBonus: 0,
    fuelBonus: 0,
    cargoBonus: 0,
    miningYieldBonus: 0.25, // 25% more ore per mining cycle
    miningSpeedBonus: 0.20, // 20% faster mining
    miningFuelEfficiency: 0,
  },
}
