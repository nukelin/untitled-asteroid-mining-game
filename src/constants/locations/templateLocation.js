// const msg = (state, text) => ({ ...state, ui: { ...state.ui, message: text } })

export default {
  id: 'template_location',    // unique identifier (camelCase or snake_case)
  label: 'Template Location', // display name shown in UI and status bar

  // All actions available at this location, shown in the action menu.
  // Built-in action IDs: 'market', 'repair', 'refuel', 'mineToggle'
  // Travel is always appended automatically.
  actions: [
    // { id: 'market',     label: 'Market'       },
    // { id: 'repair',     label: 'Repair Ship'  },
    // { id: 'refuel',     label: 'Refuel Ship'  },
    // { id: 'mineToggle', label: 'Start Mining' },
  ],

  // Logic for each action at this location.
  // Each handler receives (state, payload?) and returns new state.
  handlers: {
    // --- Earth-style service actions ---
    // repair(state) { ... },
    // refuel(state) { ... },
    // sell_ore(state, { oreType }) { ... },

    // --- mainBelt-style mining actions ---
    // mineToggle(state) { ... },
    // start_mining(state, { oreType }) { ... },
    // tick_mining(state, { now }) { ... },
    // cancel_mining(state) { ... },
  },
}
