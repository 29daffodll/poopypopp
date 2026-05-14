import { useCallback, useEffect, useState } from 'react'
import { getSupabase, getSupabaseEnvFlags, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

function todayYmd() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Statuses we treat as an active stay that can be checked out (lowercase). */
function isCheckoutableStatus(status) {
  const s = String(status ?? '').toLowerCase()
  return s === 'confirmed' || s === 'pending'
}

function bookingPk(booking) {
  return pick(booking, 'bookingid', 'booking_id', 'id')
}

export default function CheckOut({ onBack }) {
  const [bookings, setBookings] = useState([])
  const [roomLabels, setRoomLabels] = useState(() => new Map())
  const [guestNames, setGuestNames] = useState(() => new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [banner, setBanner] = useState('')

  const supabaseLive = isSupabaseConfigured()
  const envFlags = getSupabaseEnvFlags()

  const loadData = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setBookings([])
      return
    }
    setLoading(true)
    setError('')
    setBanner('')
    try {
      const { data: bookingRows, error: bErr } = await supabase
        .from('bookings')
        .select('*')
        .order('checkoutdate', { ascending: true })
      if (bErr) throw bErr

      const { data: roomRows } = await supabase.from('rooms').select('*')
      const rm = new Map()
      for (const row of roomRows ?? []) {
        const id = pick(row, 'roomid', 'room_id')
        if (id == null) continue
        const label = String(pick(row, 'roomnumber', 'room_number') ?? id)
        rm.set(Number(id), label)
        rm.set(String(id), label)
      }

      const gm = new Map()
      const gRes = await supabase.from('guests').select('*').limit(500)
      if (!gRes.error && gRes.data) {
        for (const row of gRes.data) {
          const gid = pick(row, 'guestid', 'guest_id', 'id')
          if (gid == null) continue
          const name =
            pick(row, 'guestname', 'guest_name', 'name', 'fullname', 'firstname') ?? `Guest #${gid}`
          gm.set(Number(gid), String(name))
          gm.set(String(gid), String(name))
        }
      }

      const active = (bookingRows ?? []).filter((b) => isCheckoutableStatus(pick(b, 'status')))
      setBookings(active)
      setRoomLabels(rm)
      setGuestNames(gm)
    } catch (err) {
      setError(err.message || String(err))
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadData()
    })
  }, [loadData])

  const roomLabel = (roomId) => {
    if (roomId == null) return '—'
    return roomLabels.get(Number(roomId)) ?? roomLabels.get(String(roomId)) ?? String(roomId)
  }

  const guestLabel = (guestId) => {
    if (guestId == null) return '—'
    return guestNames.get(Number(guestId)) ?? guestNames.get(String(guestId)) ?? `Guest ${guestId}`
  }

  const performCheckout = async (row) => {
    const supabase = getSupabase()
    if (!supabase) return
    const bid = bookingPk(row)
    const roomId = pick(row, 'roomid', 'room_id')
    if (bid == null) {
      setBanner('Could not read booking id from this row.')
      return
    }
    setActionId(bid)
    setBanner('')
    setError('')
    const today = todayYmd()

    const patch = {
      status: 'completed',
      checkoutdate: today
    }

    let res = await supabase.from('bookings').update(patch).eq('bookingid', bid)
    if (res.error) {
      res = await supabase.from('bookings').update(patch).eq('booking_id', bid)
    }
    if (res.error) {
      setError(res.error.message)
      setActionId(null)
      return
    }

    if (roomId != null) {
      const r1 = await supabase.from('rooms').update({ status: 'available' }).eq('roomid', roomId)
      if (r1.error) {
        await supabase.from('rooms').update({ status: 'available' }).eq('room_id', roomId)
      }
    }

    setBanner(`Booking #${bid} checked out. Room ${roomLabel(roomId)} marked available (if permitted by RLS).`)
    setActionId(null)
    await loadData()
  }

  if (!supabaseLive) {
    return (
      <div className="page-content">
        <div className="page-header">
          <button type="button" className="back-btn" onClick={onBack}>← Back</button>
          <h2>Check Out</h2>
        </div>
        <div className="room-supabase-banner room-supabase-banner--warn" role="status">
          <strong>Connect Supabase to check out real stays.</strong>{' '}
          {!envFlags.hasUrl && <>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> or <code>VITE_SUPABASE_URL</code>. </>}
          {!envFlags.hasKey && (
            <>
              Set <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> or <code>VITE_SUPABASE_ANON_KEY</code>.{' '}
            </>
          )}
          Restart <code>npm run dev</code> after editing <code>.env.local</code>.
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>← Back</button>
        <h2>Check Out</h2>
      </div>

      <p className="checkout-intro">
        Active stays come from <code>bookings</code> with status <code>confirmed</code> or <code>pending</code>. Check
        out sets status to <code>completed</code>, sets checkout date to today, and tries to set the room to{' '}
        <code>available</code> in <code>rooms</code>.
      </p>

      <div className="checkout-toolbar">
        <button type="button" className="rooms-supabase-refresh" onClick={() => void loadData()} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh list'}
        </button>
      </div>

      {error && <p className="booking-form-error checkout-banner">{error}</p>}
      {banner && <p className="checkout-banner checkout-banner--ok">{banner}</p>}

      {loading && bookings.length === 0 && <p className="room-db-bookings-muted">Loading bookings…</p>}

      {!loading && bookings.length === 0 && (
        <p className="room-db-bookings-muted">
          No active bookings to check out (nothing with status confirmed/pending), or RLS is hiding rows.
        </p>
      )}

      {bookings.length > 0 && (
        <div className="room-db-bookings-table-wrap checkout-table-wrap">
          <table className="room-db-bookings-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bookings.map((row) => {
                const bid = bookingPk(row)
                const gid = pick(row, 'guestid', 'guest_id')
                const rid = pick(row, 'roomid', 'room_id')
                const busy = actionId != null && String(actionId) === String(bid)
                return (
                  <tr key={String(bid)}>
                    <td>{bid ?? '—'}</td>
                    <td>{guestLabel(gid)}</td>
                    <td>{roomLabel(rid)}</td>
                    <td>{String(pick(row, 'checkindate', 'check_in_date') ?? '—')}</td>
                    <td>{String(pick(row, 'checkoutdate', 'check_out_date') ?? '—')}</td>
                    <td>
                      {(() => {
                        const t = pick(row, 'totalamount', 'total_amount')
                        return t != null && Number.isFinite(Number(t)) ? Number(t).toFixed(2) : String(t ?? '—')
                      })()}
                    </td>
                    <td>{String(pick(row, 'status') ?? '—')}</td>
                    <td>
                      <button
                        type="button"
                        className="submit-btn checkout-btn"
                        disabled={busy}
                        onClick={() => void performCheckout(row)}
                      >
                        {busy ? 'Saving…' : 'Check out'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
