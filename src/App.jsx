import { useEffect } from 'react'
import { useGameState } from './hooks/useGameState'
import ShipStatus from './components/ShipStatus'
import MiningStatus from './components/MiningStatus'
import Inventory from './components/Inventory'
import Travel from './components/Travel'
import LocationOptions from './components/LocationOptions'
import Money from './components/Money'

export default function App() {
  const { state, dispatch } = useGameState()
  const { ship, money, inventory, location, mining, ui } = state
  const { focusedPanel, travelIndex, locationOptionsIndex, subView, marketIndex, message } = ui

  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key

      // Escape always exits subview
      if (key === 'Escape') {
        if (subView) {
          e.preventDefault()
          dispatch({ type: 'EXIT_SUBVIEW' })
          return
        }
      }

      // Arrow left/right: switch panel focus
      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        e.preventDefault()
        // Don't switch panels while in market
        if (subView === 'market') return
        dispatch({
          type: 'FOCUS_PANEL',
          payload: focusedPanel === 'travel' ? 'locationOptions' : 'travel',
        })
        return
      }

      // Arrow up/down: move selection
      if (key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault()
        dispatch({
          type: 'MOVE_SELECTION',
          payload: {
            panel: subView === 'market' ? 'locationOptions' : focusedPanel,
            direction: key === 'ArrowUp' ? 'up' : 'down',
          },
        })
        return
      }

      // Enter: confirm
      if (key === 'Enter') {
        e.preventDefault()
        dispatch({ type: 'CONFIRM_SELECTION' })
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedPanel, subView, dispatch])

  return (
    <>
      <div className="game-title">untitled asteroid mining game</div>
      <div className="game-grid">
        {/* Row 1 */}
        <ShipStatus ship={ship} />
        <MiningStatus mining={mining} />
        <Inventory inventory={inventory} />

        {/* Row 2 */}
        <Travel
          focused={focusedPanel === 'travel'}
          location={location}
          travelIndex={travelIndex}
        />
        <LocationOptions
          focused={focusedPanel === 'locationOptions'}
          location={location}
          locationOptionsIndex={locationOptionsIndex}
          subView={subView}
          marketIndex={marketIndex}
          inventory={inventory}
        />
        <Money money={money} message={message} />
      </div>
      <div className="controls-hint">
        ←→ switch panel &nbsp;|&nbsp; ↑↓ navigate &nbsp;|&nbsp; ENTER confirm &nbsp;|&nbsp; ESC back
      </div>
    </>
  )
}
