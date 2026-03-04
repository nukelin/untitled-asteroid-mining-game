export default {
  id: 'template_ship',   // unique identifier (snake_case)
  name: 'Template Ship', // display name shown in UI

  // Base stats before any upgrades are applied.
  baseStats: {
    armor: 100,
    armorMax: 100,
    fuel: 100,
    fuelMax: 100,
    cargoMax: 500,
  },

  // Number of available slots per upgrade category.
  // Each slot can hold one equipped upgrade of that type.
  slots: {
    armor: 1,
    engine: 1,
    cargo: 1,
    mining: 1,
    misc: 2,
  },
}
