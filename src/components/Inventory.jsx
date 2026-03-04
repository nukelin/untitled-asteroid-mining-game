import Panel from './Panel'

export default function Inventory({ inventory }) {
  return (
    <Panel title="INVENTORY">
      {Object.entries(inventory).map(([ore, qty]) => (
        <div key={ore} className="inv-row">
          <span className="inv-ore">{ore.toUpperCase().padEnd(6, ' ')}</span>
          <span className="inv-qty">{qty} kg</span>
        </div>
      ))}
    </Panel>
  )
}
