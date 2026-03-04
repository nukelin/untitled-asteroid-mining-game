import Panel from './Panel'
import { formatMoney } from '../constants/gameConstants'

export default function Money({ money, message }) {
  return (
    <Panel title="MONEY">
      <div className="money-balance">
        BALANCE: <span className="money-amount">{formatMoney(money)}</span>
      </div>
      {message && (
        <div className="money-message">{message}</div>
      )}
    </Panel>
  )
}
