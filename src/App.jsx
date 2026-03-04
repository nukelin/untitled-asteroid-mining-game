// ─── App (Root Component) ─────────────────────────────────────────────────────
// This is the top-level React component. It:
//   1. Pulls all game state and the dispatch function from the useGameState hook.
//   2. Registers a global keyboard listener so the player can navigate with
//      arrow keys, confirm with Enter, and go back with Escape.
//   3. Lays out the full game UI: title, top stat panels, status bar,
//      action box, and controls hint.

import { useEffect } from 'react'
import { useGameState } from './hooks/useGameState'
import ShipStatus from './components/ShipStatus'
import Inventory from './components/Inventory'
import Money from './components/Money'
import StatusBar from './components/StatusBar'
import ActionBox from './components/ActionBox'

export default function App() {
  // Grab the entire game state tree plus the dispatch function that drives all state changes.
  const { state, dispatch } = useGameState()

  // Destructure the top-level slices of state for easy passing to child components.
  const { ship, money, inventory, location, mining, travel, ui } = state

  // actionSubView tracks whether the player has opened a sub-menu (e.g. 'travel' or 'market').
  // message is an optional transient status string shown in the status bar.
  const { actionSubView, message } = ui

  // ── Keyboard Handler ────────────────────────────────────────────────────────
  // Attach a keydown listener to the window so the whole game is keyboard-driven.
  // The effect re-runs whenever actionSubView or dispatch changes so the closure
  // always has the latest value of actionSubView.
  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key

      // ESC: close the currently open sub-menu (travel or market) and return to
      // the main action list. Does nothing if no sub-menu is open.
      if (key === 'Escape') {
        if (actionSubView) {
          e.preventDefault()
          dispatch({ type: 'EXIT_SUBVIEW' })
        }
        return
      }

      // Arrow Up / Down: move the cursor in whatever list is currently active.
      // preventDefault stops the browser from scrolling the page.
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault()
        dispatch({
          type: 'MOVE_SELECTION',
          payload: { direction: key === 'ArrowUp' ? 'up' : 'down' },
        })
        return
      }

      // Enter: confirm/execute the currently highlighted action or menu item.
      if (key === 'Enter') {
        e.preventDefault()
        dispatch({ type: 'CONFIRM_SELECTION' })
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    // Cleanup: remove the listener before the next render or on unmount,
    // so we never stack duplicate listeners.
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actionSubView, dispatch])

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Game title displayed at the very top */}
      <div className="game-title">untitled asteroid mining game</div>

      {/* Top row: three side-by-side stat panels */}
      <div className="top-row">
        {/* Armor, fuel, and cargo bars */}
        <ShipStatus ship={ship} />
        {/* Ore inventory (kg per type) */}
        <Inventory inventory={inventory} />
        {/* Current credit balance */}
        <Money money={money} />
      </div>

      {/* Single-line status bar: current location, mining progress, and flash messages */}
      <StatusBar location={location} mining={mining} travel={travel} message={message} />

      {/* Action panel: main menu, travel sub-menu, or market sub-menu */}
      <ActionBox
        location={location}
        mining={mining}
        travel={travel}
        actionIndex={ui.actionIndex}       // which main-menu item is highlighted
        actionSubView={actionSubView}       // which sub-menu is open (null | 'travel' | 'market' | 'mineOre')
        travelIndex={ui.travelIndex}        // highlighted row in the travel list
        marketIndex={ui.marketIndex}        // highlighted row in the market list
        mineOreIndex={ui.mineOreIndex}      // highlighted row in the ore picker
        inventory={inventory}
      />

      {/* Persistent hint reminding the player of the keyboard controls */}
      <div className="controls-hint">
        ↑↓ navigate &nbsp;|&nbsp; ENTER confirm &nbsp;|&nbsp; ESC back
      </div>
    </>
  )
}
