// ─── LogBox ───────────────────────────────────────────────────────────────────
// Shows a running history of player actions (mining results, purchases, travel,
// repairs, etc.). The most recent entry is shown brightest at the top; older
// entries are dimmed. Displays up to 5 entries at a time.

import Panel from './Panel'

export default function LogBox({ log }) {
  // Only show the 5 most recent entries to keep the UI compact
  const entries = log.slice(0, 5)

  return (
    <Panel title="LOG">
      {entries.length === 0 ? (
        // Placeholder shown before the player has done anything
        <div className="log-empty">No activity yet.</div>
      ) : (
        entries.map((entry, i) => (
          // The first entry (index 0) is the most recent — style it brighter
          <div key={i} className={`log-entry${i === 0 ? ' log-latest' : ''}`}>
            {entry}
          </div>
        ))
      )}
    </Panel>
  )
}
