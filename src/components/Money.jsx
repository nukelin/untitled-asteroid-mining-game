import Panel from './Panel'
import { formatMoney } from '../constants/utils'

export default function Money({ money }) {
  return (
    <Panel title="MONEY">
      <div className="money-balance">
        BALANCE: <span className="money-amount">{formatMoney(money)}</span>
      </div>
    </Panel>
  )
}
