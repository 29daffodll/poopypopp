import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase, getSupabaseEnvFlags, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

function readDefaultGuestId() {
  const raw = import.meta.env.VITE_DEFAULT_GUEST_ID || import.meta.env.NEXT_PUBLIC_DEFAULT_GUEST_ID
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

function bookingPk(row) {
  return pick(row, 'bookingid', 'booking_id', 'id')
}

function getRoomIdForType(roomType) {
  const room = roomOptions.find((r) => r.id === roomType)
  return room?.dbRoomId ?? roomOptions[0].dbRoomId
}

const roomOptions = [
  { id: 'single', title: 'Single Room', price: '$100/night', dbRoomId: 51, pricePerNight: 100 },
  { id: 'double', title: 'Double Room', price: '$150/night', dbRoomId: 52, pricePerNight: 150 },
  { id: 'suite', title: 'Suite', price: '$250/night', dbRoomId: 53, pricePerNight: 250 }
]

export default function RoomBooking({ userType, onBack, initialRoomType, initialCheckInDate, initialCheckOutDate, initialOpenBookingModal }) {
  const isAdmin = String(userType ?? '').toLowerCase() === 'admin'
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [hasAutoOpened, setHasAutoOpened] = useState(false)
  const [bookingData, setBookingData] = useState(() => {
    const def = readDefaultGuestId()
    return {
      guestName: '',
      guestId: def != null ? String(def) : '',
      roomType: initialRoomType || 'single',
      checkInDate: initialCheckInDate || '',
      checkOutDate: initialCheckOutDate || '',
      numGuests: 1
    }
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [roomBookings, setRoomBookings] = useState([])
  const [roomBookingsLoading, setRoomBookingsLoading] = useState(false)
  const [roomBookingsError, setRoomBookingsError] = useState('')
  const [allBookings, setAllBookings] = useState([])
  const [allBookingsLoading, setAllBookingsLoading] = useState(false)
  const [allBookingsError, setAllBookingsError] = useState('')
  const [editingBookingId, setEditingBookingId] = useState(null)
  const [tableActionError, setTableActionError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [showSupabaseDetails, setShowSupabaseDetails] = useState(false)

  const activeRoom = useMemo(
    () => roomOptions.find((r) => r.id === bookingData.roomType) ?? roomOptions[0],
    [bookingData.roomType]
  )
  const isEditing = editingBookingId != null

  const loadAllBookings = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setAllBookings([])
      setAllBookingsLoading(false)
      return
    }
    setAllBookingsLoading(true)
    setAllBookingsError('')
    const { data, error } = await supabase.from('bookings').select('*').limit(80)
    setAllBookingsLoading(false)
    if (error) {
      setAllBookingsError(error.message)
      setAllBookings([])
      return
    }
    const rows = data ?? []
    rows.sort((a, b) => {
      const idA = Number(pick(a, 'bookingid', 'booking_id', 'id')) || 0
      const idB = Number(pick(b, 'bookingid', 'booking_id', 'id')) || 0
      return idB - idA
    })
    setAllBookings(rows)
  }, [])

  const loadRoomBookings = useCallback(async (room) => {
    const supabase = getSupabase()
    if (!room?.dbRoomId || !supabase) {
      setRoomBookings([])
      return
    }
    setRoomBookingsLoading(true)
    setRoomBookingsError('')
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('roomid', room.dbRoomId)
      .limit(40)
    setRoomBookingsLoading(false)
    if (error) {
      setRoomBookingsError(error.message)
      setRoomBookings([])
    } else {
      const rows = data ?? []
      rows.sort((a, b) => {
        const da = String(pick(a, 'checkindate', 'check_in_date', 'checkin_date') ?? '')
        const db = String(pick(b, 'checkindate', 'check_in_date', 'checkin_date') ?? '')
        return db.localeCompare(da)
      })
      setRoomBookings(rows)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      if (!isAdmin || !isSupabaseConfigured()) {
        setRoomBookings([])
        return
      }
      const room = roomOptions.find((r) => r.id === bookingData.roomType) ?? roomOptions[0]
      void loadRoomBookings(room)
    })
    return () => {
      cancelled = true
    }
  }, [bookingData.roomType, loadRoomBookings, isAdmin])

  useEffect(() => {
    if (initialOpenBookingModal && !hasAutoOpened) {
      setShowBookingModal(true)
      setHasAutoOpened(true)
    }
  }, [initialOpenBookingModal, hasAutoOpened])

  useEffect(() => {
    if (!isAdmin) {
      setAllBookings([])
      return
    }
    queueMicrotask(() => {
      void loadAllBookings()
    })
  }, [loadAllBookings, isAdmin])

  useEffect(() => {
    queueMicrotask(() => {
      if (initialRoomType) {
        const room = roomOptions.find((option) => option.id === initialRoomType)
        if (room) {
          setBookingData((prev) => ({ ...prev, roomType: initialRoomType }))
        }
      }
    })
  }, [initialRoomType])

  useEffect(() => {
    queueMicrotask(() => {
      setBookingData((prev) => ({
        ...prev,
        checkInDate: initialCheckInDate || prev.checkInDate,
        checkOutDate: initialCheckOutDate || prev.checkOutDate
      }))
    })
  }, [initialCheckInDate, initialCheckOutDate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setBookingData((prev) => ({ ...prev, [name]: value }))
  }

  const resetBookingForm = (roomForType = null) => {
    const def = readDefaultGuestId()
    setEditingBookingId(null)
    setBookingData({
      guestName: '',
      guestId: def != null ? String(def) : '',
      roomType: roomForType?.id || 'single',
      checkInDate: '',
      checkOutDate: '',
      numGuests: 1
    })
  }

  const handleEditBooking = (row) => {
    const bid = bookingPk(row)
    if (bid == null) return

    const roomId = Number(pick(row, 'roomid', 'room_id'))
    const roomType = roomOptions.find((r) => r.dbRoomId === roomId)?.id || 'single'
    setEditingBookingId(bid)
    setBookingData({
      guestName: String(pick(row, 'guestname', 'guest_name', 'name') ?? ''),
      guestId: String(pick(row, 'guestid', 'guest_id') ?? readDefaultGuestId() ?? ''),
      roomType,
      checkInDate: String(pick(row, 'checkindate', 'check_in_date', 'checkin_date') ?? ''),
      checkOutDate: String(pick(row, 'checkoutdate', 'check_out_date', 'checkout_date') ?? ''),
      numGuests: Number(pick(row, 'numguests', 'num_guests', 'numGuests') || 1)
    })
    setShowBookingModal(true)
  }

  const handleCancelBooking = async (row) => {
    setTableActionError('')
    setActionId(null)
    const bid = bookingPk(row)
    if (bid == null) {
      setTableActionError('Could not determine booking ID for cancel action.')
      return
    }

    if (!window.confirm(`Cancel booking #${bid}? This will mark it as cancelled in the bookings table.`)) {
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      setTableActionError('Supabase is not configured. Connect Supabase to cancel real bookings.')
      return
    }

    setActionId(bid)
    const patch = { status: 'cancelled' }
    let res = await supabase.from('bookings').update(patch).eq('bookingid', bid)
    if (res.error) {
      res = await supabase.from('bookings').update(patch).eq('booking_id', bid)
    }
    setActionId(null)

    if (res.error) {
      setTableActionError(res.error.message)
      return
    }

    await loadRoomBookings(activeRoom)
    await loadAllBookings()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    const supabase = getSupabase()

    if (!supabase) {
      const verb = editingBookingId ? 'updated' : 'confirmed'
      alert(`Booking ${verb} for ${bookingData.guestName} in the ${activeRoom.title}`)
      setShowBookingModal(false)
      resetBookingForm(null)
      return
    }

    const defaultGid = readDefaultGuestId()
    const gid = Number(String(bookingData.guestId).trim()) || defaultGid
    const hasGuestId = Number.isFinite(gid) && gid > 0

    const checkIn = new Date(`${bookingData.checkInDate}T12:00:00`)
    const checkOut = new Date(`${bookingData.checkOutDate}T12:00:00`)
    if (!(checkIn < checkOut)) {
      setSubmitError('Check-out must be after check-in.')
      return
    }

    const nights = Math.round((checkOut - checkIn) / 86400000)
    if (nights < 1) {
      setSubmitError('Book at least one night.')
      return
    }

    const total = nights * activeRoom.pricePerNight

    let bookingGuestId = hasGuestId ? gid : null
    if (!bookingGuestId) {
      const guestName = String(bookingData.guestName ?? '').trim()
      if (!guestName) {
        setSubmitError('Guest name is required to auto-create a guest record.')
        return
      }

      const newGuest = await supabase
        .from('guests')
        .insert({ guestname: guestName })
        .select('guestid, guest_id, id')
        .single()

      if (newGuest.error) {
        const message = String(newGuest.error.message || '')
        if (message.includes('Could not find the table') || message.includes('find the table')) {
          bookingGuestId = 1
        } else {
          setSubmitError(`Could not auto-create guest record: ${newGuest.error.message}`)
          setSubmitLoading(false)
          return
        }
      } else {
        bookingGuestId = Number(pick(newGuest.data, 'guestid', 'guest_id', 'id'))
      }

      if (!Number.isFinite(bookingGuestId) || bookingGuestId <= 0) {
        setSubmitError('Unable to determine a valid guest ID for the new guest record.')
        setSubmitLoading(false)
        return
      }
    }

    const payload = {
      guestid: bookingGuestId,
      roomid: activeRoom.dbRoomId,
      checkindate: bookingData.checkInDate,
      checkoutdate: bookingData.checkOutDate,
      totalamount: total
    }

    setSubmitLoading(true)
    let data = null
    let error = null

    if (editingBookingId) {
      let res = await supabase.from('bookings').update(payload).eq('bookingid', editingBookingId).select('bookingid')
      if (res.error) {
        res = await supabase.from('bookings').update(payload).eq('booking_id', editingBookingId).select('booking_id')
      }
      data = res.data
      error = res.error
    } else {
      const res = await supabase
        .from('bookings')
        .insert({ ...payload, status: 'pending' })
        .select('bookingid')
        .single()
      data = res.data
      error = res.error
    }
    setSubmitLoading(false)

    if (error) {
      setSubmitError(error.message)
      return
    }

    const id = pick(data?.[0] ?? data, 'bookingid', 'booking_id')
    alert(
      editingBookingId
        ? `Booking #${id ?? '?'} updated (${nights} night(s), total $${total.toFixed(2)})`
        : `Booking saved. Reference #${id ?? '?'} (${nights} night(s), total $${total.toFixed(2)})`
    )
    setShowBookingModal(false)
    resetBookingForm(activeRoom)
    await loadRoomBookings(activeRoom)
    await loadAllBookings()
  }

  const supabaseLive = isSupabaseConfigured()
  const envFlags = getSupabaseEnvFlags()

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Room Booking</h2>
      </div>
      {supabaseLive ? (
        isAdmin ? (
          <div className="room-supabase-disclosure">
            <button
              type="button"
              className="room-supabase-disclosure-toggle"
              onClick={() => setShowSupabaseDetails((v) => !v)}
              aria-expanded={showSupabaseDetails}
              aria-controls="supabase-connection-details"
              id="supabase-disclosure-btn"
            >
              <span className="room-supabase-disclosure-chevron" aria-hidden>
                {showSupabaseDetails ? '▼' : '▶'}
              </span>
              <span className="room-supabase-disclosure-label">Supabase connection</span>
              <span className="room-supabase-disclosure-badge">live</span>
              <span className="room-supabase-disclosure-hint">
                {showSupabaseDetails ? 'Hide details' : `Show details · roomid ${activeRoom.dbRoomId}`}
              </span>
            </button>
            {showSupabaseDetails && (
              <div
                className="room-supabase-disclosure-body"
                id="supabase-connection-details"
                role="region"
                aria-labelledby="supabase-disclosure-btn"
              >
                <p>
                  Live data from your <code>bookings</code> table appears below. The booking form only needs a guest name and dates.
                  Room categories are mapped to room IDs automatically.
                </p>
                <p>
                  Current category <strong>{activeRoom.title}</strong> maps to <code>roomid</code>{' '}
                  <strong>{activeRoom.dbRoomId}</strong> (edit <code>dbRoomId</code> in RoomBooking.jsx if it does not
                  match your <code>rooms</code> table).
                </p>
                <p>
                  If your schema does not include a <code>guests</code> table, the booking will still work using a fallback guest reference.
                </p>
                <div className="room-supabase-disclosure-actions">
                  <button type="button" className="room-supabase-refresh" onClick={() => void loadAllBookings()}>
                    Refresh list
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null
      ) : (
        <div className="room-supabase-banner room-supabase-banner--warn" role="status">
          <strong>Supabase is not connected in this build.</strong>{' '}
          {!envFlags.hasUrl && <>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> or <code>VITE_SUPABASE_URL</code>. </>}
          {!envFlags.hasKey && (
            <>
              Add <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, or{' '}
              <code>VITE_SUPABASE_ANON_KEY</code>.{' '}
            </>
          )}
          Save <code>.env.local</code> and restart <code>npm run dev</code> so Vite picks up variables.
        </div>
      )}

      {supabaseLive && isAdmin && (
        <div className="room-db-bookings-section room-all-bookings-section">
          <h3>All bookings</h3>
          <p className="room-db-bookings-hint">
            Review all reservations and use Edit or Cancel to update existing rows.
          </p>
          {allBookingsLoading && <p className="room-db-bookings-muted">Loading…</p>}
          {allBookingsError && <p className="booking-form-error">{allBookingsError}</p>}
          {tableActionError && <p className="booking-form-error">{tableActionError}</p>}
          {!allBookingsLoading && !allBookingsError && allBookings.length === 0 && (
            <p className="room-db-bookings-muted">No rows returned from <code>bookings</code> (empty table or RLS blocking read).</p>
          )}
          {!allBookingsLoading && !allBookingsError && allBookings.length > 0 && (
            <div className="room-db-bookings-table-wrap">
              <table className="room-db-bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Guest</th>
                    <th>Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((row, idx) => {
                    const bid = bookingPk(row)
                    const busy = actionId != null && String(actionId) === String(bid)
                    return (
                      <tr key={bid != null ? `booking-${bid}` : `row-${idx}`}>
                        <td>{bid ?? '—'}</td>
                        <td>{pick(row, 'guestid', 'guest_id') ?? '—'}</td>
                        <td>{pick(row, 'roomid', 'room_id') ?? '—'}</td>
                        <td>{String(pick(row, 'checkindate', 'check_in_date', 'checkin_date') ?? '—')}</td>
                        <td>{String(pick(row, 'checkoutdate', 'check_out_date', 'checkout_date') ?? '—')}</td>
                        <td>
                          {(() => {
                            const t = pick(row, 'totalamount', 'total_amount')
                            return t != null && Number.isFinite(Number(t)) ? Number(t).toFixed(2) : (t ?? '—')
                          })()}
                        </td>
                        <td>{String(pick(row, 'status') ?? '—')}</td>
                        <td>
                          <button type="button" className="submit-btn" onClick={() => handleEditBooking(row)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="cancel-btn"
                            disabled={busy}
                            onClick={() => void handleCancelBooking(row)}
                          >
                            {busy ? 'Cancelling…' : 'Cancel'}
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
      )}

      <div className="room-booking-room-toolbar">
        <label htmlFor="room-type-select">Room category</label>
        <select
          id="room-type-select"
          name="roomType"
          className="room-booking-room-select"
          value={bookingData.roomType}
          onChange={handleChange}
        >
          {roomOptions.map((room) => (
            <option key={room.id} value={room.id}>
              {room.title} ({room.price})
            </option>
          ))}
        </select>
        <button type="button" className="submit-btn room-booking-toolbar-cta" onClick={() => setShowBookingModal(true)}>
          New booking
        </button>
      </div>

      {supabaseLive && isAdmin && (
        <div className="room-db-bookings-section">
          <h3>Reservations for this room</h3>
          {roomBookingsLoading && <p className="room-db-bookings-muted">Loading…</p>}
          {roomBookingsError && <p className="booking-form-error">{roomBookingsError}</p>}
          {!roomBookingsLoading && !roomBookingsError && roomBookings.length === 0 && (
            <p className="room-db-bookings-muted">No rows in <code>bookings</code> for this <code>roomid</code> yet.</p>
          )}
          {!roomBookingsLoading && !roomBookingsError && roomBookings.length > 0 && (
            <div className="room-db-bookings-table-wrap">
              <table className="room-db-bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roomBookings.map((row, idx) => {
                    const bid = bookingPk(row)
                    const busy = actionId != null && String(actionId) === String(bid)
                    return (
                      <tr key={bid != null ? `rb-${bid}` : `r-${idx}`}>
                        <td>{bid ?? '—'}</td>
                        <td>{String(pick(row, 'checkindate', 'check_in_date', 'checkin_date') ?? '—')}</td>
                        <td>{String(pick(row, 'checkoutdate', 'check_out_date', 'checkout_date') ?? '—')}</td>
                        <td>
                          {(() => {
                            const t = pick(row, 'totalamount', 'total_amount')
                            return t != null && Number.isFinite(Number(t)) ? Number(t).toFixed(2) : (t ?? '—')
                          })()}
                        </td>
                        <td>{String(pick(row, 'status') ?? '—')}</td>
                        <td>
                          <button type="button" className="submit-btn" onClick={() => handleEditBooking(row)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="cancel-btn"
                            disabled={busy}
                            onClick={() => void handleCancelBooking(row)}
                          >
                            {busy ? 'Cancelling…' : 'Cancel'}
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
      )}

      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditing ? `Edit booking #${editingBookingId}` : `New booking — ${activeRoom.title}`}</h2>
              <button type="button" className="modal-close-btn" onClick={() => setShowBookingModal(false)}>
                ✕
              </button>
            </div>
            <p className="modal-room-line">{activeRoom.price}</p>

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                <label>Guest Name *</label>
                <input
                  type="text"
                  name="guestName"
                  value={bookingData.guestName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Sarah Lopez"
                />
                <p className="room-db-bookings-hint">
                  Only the guest name is needed here. The booking system automatically generates or assigns a guest ID.
                </p>
              </div>

              <div className="form-group">
                <label>Check-in Date *</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={bookingData.checkInDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Check-out Date *</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={bookingData.checkOutDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Guests *</label>
                <input
                  type="number"
                  name="numGuests"
                  value={bookingData.numGuests}
                  onChange={handleChange}
                  min="1"
                  max="4"
                  required
                />
              </div>

              {submitError && <p className="booking-form-error">{submitError}</p>}

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowBookingModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitLoading}>
                  {submitLoading ? 'Saving…' : isEditing ? 'Save changes' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
