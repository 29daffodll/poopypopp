import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'

function formatTimestamp(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return String(value)
  }
}

export default function Housekeeping({ onBack }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const supabaseLive = isSupabaseConfigured()

  const loadServiceRequests = useCallback(async () => {
    if (!supabaseLive) {
      setRequests([])
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      setRequests([])
      return
    }

    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('servicerequests')
        .select('*')
        .order('requestedat', { ascending: false })
        .limit(100)
      if (error) throw error
      setRequests(data ?? [])
    } catch (err) {
      setError(err.message || String(err))
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [supabaseLive])

  useEffect(() => {
    if (!supabaseLive) return
    void loadServiceRequests()
  }, [loadServiceRequests, supabaseLive])

  const updateRequestStatus = async (request, nextStatus) => {
    const supabase = getSupabase()
    if (!supabase) return

    setUpdatingId(request.service ?? request.serviceid ?? request.id)
    setError('')
    try {
      const payload = { status: nextStatus }
      if (nextStatus === 'completed') {
        payload.completedat = new Date().toISOString()
      }
      const { error } = await supabase
        .from('servicerequests')
        .update(payload)
        .eq('service', request.service ?? request.serviceid ?? request.id)

      if (error) {
        throw error
      }
      await loadServiceRequests()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setUpdatingId(null)
    }
  }

  const nextStatus = (status) => {
    if (status === 'pending') return 'in_progress'
    if (status === 'in_progress') return 'completed'
    return null
  }

  return (
    <div className="page-content hk-page">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Housekeeping</h2>
      </div>

      {!supabaseLive && (
        <div className="room-supabase-banner room-supabase-banner--warn" role="status">
          <strong>Supabase not connected.</strong> Service request data is unavailable until you configure Supabase.
        </div>
      )}

      {supabaseLive && (
        <div className="hk-service-panel">
          <div className="hk-toolbar">
            <div className="hk-toolbar-copy">
              <h3>Service requests</h3>
              <p>View and manage guest service requests from the connected Supabase table.</p>
            </div>
            <button type="button" className="rooms-supabase-refresh" onClick={() => void loadServiceRequests()} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {error && <p className="booking-form-error checkout-banner">{error}</p>}

          {loading && requests.length === 0 && <p className="room-db-bookings-muted">Loading service requests…</p>}

          {!loading && requests.length === 0 && (
            <p className="room-db-bookings-muted">No service requests found.</p>
          )}

          {requests.length > 0 && (
            <div className="hk-requests-table-wrap">
              <table className="hk-requests-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Booking</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Requested</th>
                    <th>Notes</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const id = request.service ?? request.serviceid ?? request.id
                    const next = nextStatus(request.status)
                    return (
                      <tr key={id ?? JSON.stringify(request)}>
                        <td>{id ?? '—'}</td>
                        <td>{request.bookingid ?? '—'}</td>
                        <td>{request.servicetype ?? '—'}</td>
                        <td>{request.status ?? '—'}</td>
                        <td>{formatTimestamp(request.requestedat)}</td>
                        <td>{request.notes ?? '—'}</td>
                        <td>
                          {next ? (
                            <button
                              type="button"
                              className="submit-btn checkout-btn"
                              onClick={() => void updateRequestStatus(request, next)}
                              disabled={updatingId === id}
                            >
                              {updatingId === id ? 'Updating…' : `Mark ${next.replace('_', ' ')}`}
                            </button>
                          ) : (
                            <span className="hk-request-completed">Done</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
