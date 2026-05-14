export default function Housekeeping({ onBack }) {
  return (
    <div className="page-content hk-page">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Housekeeping</h2>
      </div>

      <p className="hk-intro">
        Coordinate cleaning and room turns. Live room status lives on the <strong>Rooms</strong> dashboard; use this
        page for shift notes and handoffs until you connect a tasks or tickets table in Supabase.
      </p>

      <div className="hk-panels">
        <section className="hk-card">
          <h3>Shift checklist</h3>
          <ul className="hk-list">
            <li>Vacant rooms marked dirty after checkout</li>
            <li>Supplies restocked on carts (linen, amenities)</li>
            <li>Maintenance flags from front desk reviewed</li>
            <li>Common areas walk-through complete</li>
          </ul>
        </section>
        <section className="hk-card">
          <h3>Priorities</h3>
          <p className="hk-muted">
            Replace this block with your own workflow: Supabase table for tasks, room-by-room status, or integrations.
            Priority rooms can mirror <code>rooms.status</code> (for example <code>occupied</code> turning to{' '}
            <code>available</code> after inspection).
          </p>
        </section>
      </div>
    </div>
  )
}
