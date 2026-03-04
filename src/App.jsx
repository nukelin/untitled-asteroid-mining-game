import { useEffect } from 'react'
import { useGameState } from './hooks/useGameState'
import ShipStatus from './components/ShipStatus'
import Inventory from './components/Inventory'
import Money from './components/Money'
import StatusBar from './components/StatusBar'
import ActionBox from './components/ActionBox'

export default function App() {
  const { state, dispatch } = useGameState()
  const { ship, money, inventory, location, mining, ui } = state
  const { actionSubView, message } = ui

  useEffect(() => {
    function handleKeyDown(e) {
      const key = e.key

      if (key === 'Escape') {
        if (actionSubView) {
          e.preventDefault()
          dispatch({ type: 'EXIT_SUBVIEW' })
        }
        return
      }

      if (key === 'ArrowUp' || key === 'ArrowDown') {
        e.preventDefault()
        dispatch({
          type: 'MOVE_SELECTION',
          payload: { direction: key === 'ArrowUp' ? 'up' : 'down' },
        })
        return
      }

      if (key === 'Enter') {
        e.preventDefault()
        dispatch({ type: 'CONFIRM_SELECTION' })
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [actionSubView, dispatch])

  return (
    <>
      <div className="game-title">untitled asteroid mining game</div>
      <div className="top-row">
        <ShipStatus ship={ship} />
        <Inventory inventory={inventory} />
        <Money money={money} />
      </div>
      <StatusBar location={location} mining={mining} message={message} />
      <ActionBox
        location={location}
        mining={mining}
        actionIndex={ui.actionIndex}
        actionSubView={actionSubView}
        travelIndex={ui.travelIndex}
        marketIndex={ui.marketIndex}
        inventory={inventory}
      />
      <div className="controls-hint">
        ↑↓ navigate &nbsp;|&nbsp; ENTER confirm &nbsp;|&nbsp; ESC back
      </div>
    </>
  )
}
