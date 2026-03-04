# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at localhost:5173
npm run build    # production build
npm run preview  # preview production build
```

No test runner or linter is configured.

## Architecture

This is a keyboard-driven React game (Vite + React 18). All interaction is via arrow keys, Enter, and Escape — no mouse input.

### State

All game state lives in a single `useReducer` in `src/hooks/useGameState.js`. State shape:
- `ship` — armor, fuel, cargo (current + max values)
- `inventory` — kg of each ore type held
- `money` — credits
- `location` — current location ID string
- `mining` — active flag, ore type, progress, timing, fuelAtStart
- `travel` — active flag, destination, progress, timing
- `ui` — cursor indices, active sub-menu (`actionSubView`), flash message

The reducer handles all transitions. Two `setInterval` loops run as `useEffect`s inside the hook — one fires `TICK_MINING` every 250ms while mining, one fires `TICK_TRAVEL` every 100ms while traveling.

`App.jsx` owns the global `keydown` listener and passes state slices down to components as props. Components are purely presentational — they never dispatch directly.

### Constants / Data

`src/constants/` is organized by domain. Each domain uses a folder with an `index.js` that aggregates individual files and re-exports derived constants for backward compatibility:

- `ores/` — one file per ore (`iron.js`, etc.), each exporting `{ id, weight, durationMult, yieldMult, marketPrice }`. `index.js` derives `ORE_TYPES`, `ORE_WEIGHTS`, `ORE_MODIFIERS`, `MARKET_PRICES`.
- `locations/` — one file per location, each exporting `{ id, label, actions, handlers }`. `index.js` derives `TRAVEL_DESTINATIONS`, `LOCATION_OPTIONS`, `LOCATIONS_BY_ID`.
- `ships/` — one file per ship definition with `baseStats` and `slots` per upgrade category.
- `shipUpgrades/` — one file per upgrade with `{ id, name, slot, price, stats }`. Stats are additive bonuses to ship stats.
- `travel.js`, `mining.js`, `shipServices.js` — flat numeric constants.
- `utils.js` — `renderBar`, `formatMoney`, `getActionItems`, `pickWeightedOre`.

### Location Handler Pattern

Location-specific game logic lives inside the location file itself, not in `useGameState.js`. Each location exports a `handlers` object keyed by action ID. The reducer cases delegate to `LOCATIONS_BY_ID[state.location]?.handlers?.handlerName?.(state, payload)`.

- `earth.js` defines `repair`, `refuel`, `sell_ore`
- `mainBelt.js` defines `mineToggle`, `start_mining`, `tick_mining`, `cancel_mining`

To add a new location with custom logic, copy `templateLocation.js`, define its `actions` array and `handlers`, then register it in `locations/index.js`.

### Adding Content

- **New ore:** copy `src/constants/ores/iron.js`, fill in the 5 fields, add import to `ores/index.js`.
- **New location:** copy `src/constants/locations/templateLocation.js`, implement `handlers`, add import to `locations/index.js`.
- **New ship upgrade:** copy `src/constants/shipUpgrades/templateUpgrade.js`, set `slot` and non-zero `stats`, add import to `shipUpgrades/index.js`.
- **New ship:** copy `src/constants/ships/templateShip.js`, adjust `baseStats` and `slots`, add import to `ships/index.js`.

### Circular Dependency Note

`utils.js` imports from `constants/locations` (for `LOCATIONS_BY_ID`). Location files must **not** import from `utils.js` — use a local `const msg = (state, text) => ({ ...state, ui: { ...state.ui, message: text } })` helper instead.
