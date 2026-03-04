// ─── App (Root Component) ─────────────────────────────────────────────────────
// This is the top-level React component. It:
//   1. Pulls all game state and the dispatch function from the useGameState hook.
//   2. Registers a global keyboard listener so the player can navigate with
//      arrow keys, confirm with Enter, and go back with Escape.
//   3. Lays out the full game UI: title, top stat panels, status bar,
//      action box, and controls hint.

import { useEffect } from 'react'
import { useGameState } from './hooks/useGameState'
import StatusBar from './components/StatusBar'
import ActionBox from './components/ActionBox'
import LogBox from './components/LogBox'

export default function App() {
  // Grab the entire game state tree plus the dispatch function that drives all state changes.
  const { state, dispatch } = useGameState()

  // Destructure the top-level slices of state for easy passing to child components.
  const { ship, money, inventory, location, mining, travel, ui, upgrades, equipped } = state

  // actionSubView tracks which sub-menu is open:
  //   null | 'travel' | 'sell' | 'sellOre' | 'mineOre'
  // message is an optional transient status string shown in the status bar.
  const { actionSubView, message, log } = ui

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

      {/* Status panel: ship stats, money, location, activity, and inventory */}
      <StatusBar location={location} mining={mining} travel={travel} ship={ship} money={money} inventory={inventory} message={message} />

      {/* Action panel: pinned to the bottom of the screen */}
      <div className="action-box-bottom">
      {/* Activity log: shows the last 5 player actions above the action box */}
      <LogBox log={log} />
      <ActionBox
        location={location}
        mining={mining}
        travel={travel}
        actionIndex={ui.actionIndex}       // which main-menu item is highlighted
        actionSubView={actionSubView}       // null | 'travel' | 'sell' | 'sellOre' | 'mineOre'
        travelIndex={ui.travelIndex}        // highlighted row in the travel list
        marketIndex={ui.marketIndex}        // highlighted row in the ore list inside sellOre
        mineOreIndex={ui.mineOreIndex}      // highlighted row in the ore picker
        buyerIndex={ui.buyerIndex}          // highlighted row in the buyer country list
        buyerPrices={ui.buyerPrices}        // price table generated when Sell is opened
        selectedBuyer={ui.selectedBuyer}    // id of the buyer country the player chose
        shopIndex={ui.shopIndex}                    // highlighted row in the upgrade shop
        upgrades={upgrades}                         // array of purchased upgrade IDs
        money={money}                               // used to dim unaffordable upgrades
        equipSlotIndex={ui.equipSlotIndex}          // highlighted slot in the equip view
        equipUpgradeIndex={ui.equipUpgradeIndex}    // highlighted upgrade in the slot view
        selectedEquipSlot={ui.selectedEquipSlot}    // slot id the player chose to modify
        equipped={equipped}                         // { armor: id|null, engine: id|null, ... }
        inventory={inventory}
      />
      {/* Persistent hint reminding the player of the keyboard controls */}
      <div className="controls-hint">
        ↑↓ navigate &nbsp;|&nbsp; ENTER confirm &nbsp;|&nbsp; ESC back
      </div>
      </div>
    </>
  )
}
