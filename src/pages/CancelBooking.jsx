import { useCallback, useEffect, useState } from 'react'
import { getSupabase, getSupabaseEnvFlags, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

/** Bookings that can still be cancelled (same as active stays on Check Out). */
function isCancellableStatus(status) {
  const s = String(status ?? '').toLowerCase()
  return s === 'confirmed' || s === 'pending'
}

function bookingPk(booking) {
  return pick(booking, 'bookingid', 'booking_id', 'id')
}

function namesMatch(entered, expected) {
  const a = String(entered ?? '')
    .trim()
    .toLowerCase()
  const b = String(expected ?? '')
    .trim()
    .toLowerCase()
  return a.length > 0 && a === b
}

export default function CancelBooking({ onBack }) {
  const [bookings, setBookings] = useState([])
  const [roomLabels, setRoomLabels] = useState(() => new Map())
  const [guestNames, setGuestNames] = useState(() => new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cancelData, setCancelData] = useState({
    bookingId: '',
    guestName: '',
    cancellationReason: ''
  })

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
      const { data: bookingRows, error: bErr } = await supabase.from('bookings').select('*').limit(800)
      if (bErr) throw bErr

      const { data: roomRows } = await supabase.from('rooms').select('*')
      const rm = new Map()
      for (const row of roomRows ?? []) {
        const id = pick(row, 'roomid', 'room_id')
        if (id == null) continue
        const num = pick(row, 'roomnumber', 'room_number')
        const typ = pick(row, 'roomtype', 'room_type')
        const label = typ != null ? `${num ?? id} — ${typ}` : String(num ?? id)
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

      const active = (bookingRows ?? []).filter((b) => isCancellableStatus(pick(b, 'status')))
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setCancelData((prev) => ({ ...prev, [name]: value }))
  }

  const fillFromRow = (row) => {
    const bid = bookingPk(row)
    const gid = pick(row, 'guestid', 'guest_id')
    setCancelData({
      bookingId: bid != null ? String(bid) : '',
      guestName: guestLabel(gid),
      cancellationReason: ''
    })
    setError('')
    setBanner('')
  }

  const cancelBookingRow = async (row, reason) => {
    if (!row) return
    setError('')
    setBanner('')

    const supabase = getSupabase()
    if (!supabase) return

    const bid = Number(bookingPk(row))
    if (!Number.isFinite(bid) || bid <= 0) {
      setError('Unable to cancel: invalid booking row.')
      return
    }

    setSubmitting(true)
    try {
      const tryPatches = [
        { status: 'cancelled', cancellationreason: reason },
        { status: 'cancelled', cancellation_reason: reason },
        { status: 'cancelled' }
      ]

      let lastErr = null
      let ok = false
      for (const patch of tryPatches) {
        let res = await supabase.from('bookings').update(patch).eq('bookingid', bid)
        if (res.error) {
          res = await supabase.from('bookings').update(patch).eq('booking_id', bid)
        }
        if (!res.error) {
          ok = true
          break
        }
        lastErr = res.error
      }
      if (!ok) {
        setError(lastErr?.message ?? 'Unable to cancel booking.')
        return
      }

      const roomId = pick(row, 'roomid', 'room_id')
      if (roomId != null) {
        const r1 = await supabase.from('rooms').update({ status: 'available' }).eq('roomid', roomId)
        if (r1.error) {
          await supabase.from('rooms').update({ status: 'available' }).eq('room_id', roomId)
        }
      }

      setBanner(
        `Booking #${bid} cancelled.${reason ? ` Reason: ${reason}.` : ''} Room ${roomLabel(roomId)} was set to available where RLS allows.`
      )
      setCancelData({ bookingId: '', guestName: '', cancellationReason: '' })
      await loadData()
    } finally {
      setSubmitting(false)
    }
  }

  const handleRowCancel = async (row) => {
    const bid = bookingPk(row)
    if (!window.confirm(`Cancel booking #${bid}? This will mark it as cancelled in the bookings table.`)) {
      return
    }
    await cancelBookingRow(row, 'Cancelled from the cancel booking page.')
  }

  const performCancel = async (e) => {
    e.preventDefault()
    setError('')
    setBanner('')

    const supabase = getSupabase()
    if (!supabase) return

    const bidRaw = String(cancelData.bookingId).trim()
    const bid = Number(bidRaw)
    if (!Number.isFinite(bid) || bid <= 0) {
      setError('Enter the numeric booking ID from the table (for example 40).')
      return
    }

    const row = bookings.find((b) => String(bookingPk(b)) === String(bid))
    if (!row) {
      setError('That booking is not in the current list. It may already be completed or cancelled — refresh and try again.')
      return
    }

    const gid = pick(row, 'guestid', 'guest_id')
    const expectedGuest = guestLabel(gid)
    if (!namesMatch(cancelData.guestName, expectedGuest)) {
      setError(`Guest name must match the reservation exactly: "${expectedGuest}".`)
      return
    }

    const reason = String(cancelData.cancellationReason ?? '').trim()
    if (!reason) {
      setError('Enter a cancellation reason.')
      return
    }

    await cancelBookingRow(row, reason)
  }

  if (!supabaseLive) {
    return (
      <div className="page-content cancel-booking-page">
        <div className="page-header">
          <button type="button" className="back-btn" onClick={onBack}>
            ← Back
          </button>
          <h2>Cancel Booking</h2>
        </div>
        <div className="room-supabase-banner room-supabase-banner--warn" role="status">
          <strong>Connect Supabase to cancel real bookings.</strong>{' '}
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
    <div className="page-content cancel-booking-page">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Cancel Booking</h2>
      </div>

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
          No cancellable bookings (nothing with status confirmed/pending), or RLS is hiding rows.
        </p>
      )}

      {bookings.length > 0 && (
        <div className="room-db-bookings-table-wrap checkout-table-wrap">
          <table className="room-db-bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bookings.map((row, idx) => {
                const bid = bookingPk(row)
                const gid = pick(row, 'guestid', 'guest_id')
                const rid = pick(row, 'roomid', 'room_id')
                return (
                  <tr key={bid != null ? `cancel-${bid}` : `cancel-row-${idx}`}>
                    <td>{bid ?? '—'}</td>
                    <td>{guestLabel(gid)}</td>
                    <td>{roomLabel(rid)}</td>
                    <td>{String(pick(row, 'checkindate', 'check_in_date', 'checkin_date') ?? '—')}</td>
                    <td>{String(pick(row, 'checkoutdate', 'check_out_date', 'checkout_date') ?? '—')}</td>
                    <td>{String(pick(row, 'status') ?? '—')}</td>
                    <td>
                      <div className="cancel-row-actions">
                      <button type="button" className="submit-btn checkout-btn" onClick={() => fillFromRow(row)} disabled={submitting}>
                        Fill form
                      </button>
                      <button
                        type="button"
                        className="submit-btn checkout-btn"
                        onClick={() => void handleRowCancel(row)}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                    </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={performCancel} className="page-form cancel-booking-form">
        <h3 className="cancel-booking-form-title">Confirm cancellation</h3>
        <div className="form-group">
          <label htmlFor="cancel-booking-id">Booking ID</label>
          <input
            id="cancel-booking-id"
            type="text"
            name="bookingId"
            inputMode="numeric"
            value={cancelData.bookingId}
            onChange={handleChange}
            placeholder="Numeric ID from the table, e.g. 40"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cancel-guest-name">Guest name</label>
          <input
            id="cancel-guest-name"
            type="text"
            name="guestName"
            value={cancelData.guestName}
            onChange={handleChange}
            placeholder="Must match the guest column exactly"
            autoComplete="name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="cancel-reason">Cancellation reason</label>
          <textarea
            id="cancel-reason"
            name="cancellationReason"
            value={cancelData.cancellationReason}
            onChange={handleChange}
            rows={4}
            placeholder="Required for audit trail (stored in DB if your table has a reason column)"
            required
          />
        </div>
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Cancelling…' : 'Cancel booking'}
        </button>
      </form>
    </div>
  )
}
