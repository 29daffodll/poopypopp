import { useCallback, useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'

const roomServiceMenu = {
  room_service: [
    { id: 'club-sandwich', title: 'Club Sandwich', description: 'Grilled chicken, bacon, lettuce & tomato', price: '₱450' },
    { id: 'caesar-salad', title: 'Caesar Salad', description: 'Crisp romaine, parmesan & house dressing', price: '₱320' },
    { id: 'margherita-pizza', title: 'Margherita Pizza', description: 'Classic tomato, mozzarella & basil', price: '₱620' },
    { id: 'chicken-parmesan', title: 'Chicken Parmesan', description: 'Breaded chicken, marinara, melted cheese', price: '₱680' },
    { id: 'beef-burger', title: 'Beef Burger', description: 'Juicy patty, cheddar cheese, fries', price: '₱540' },
    { id: 'pasta-alfredo', title: 'Pasta Alfredo', description: 'Creamy parmesan sauce with penne pasta', price: '₱560' },
    { id: 'fish-tacos', title: 'Fish Tacos', description: 'Crispy fish, slaw, avocado crema', price: '₱490' },
    { id: 'steak-salad', title: 'Steak Salad', description: 'Sliced steak, greens & balsamic glaze', price: '₱720' },
    { id: 'chocolate-mousse', title: 'Chocolate Mousse', description: 'Rich and creamy dessert', price: '₱280' }
  ],
  mini_bar: [
    { id: 'sparkling-water', title: 'Sparkling Water', description: 'Refreshing mineral water', price: '₱120' },
    { id: 'orange-juice', title: 'Orange Juice', description: 'Fresh squeezed orange juice', price: '₱140' },
    { id: 'beer', title: 'Craft Beer', description: 'Local craft lager', price: '₱180' },
    { id: 'red-wine', title: 'Red Wine', description: 'Glass of house red', price: '₱260' },
    { id: 'white-wine', title: 'White Wine', description: 'Glass of house white', price: '₱260' },
    { id: 'chips', title: 'Potato Chips', description: 'Salted crisps', price: '₱95' },
    { id: 'chocolate', title: 'Chocolate Bar', description: 'Premium dark chocolate', price: '₱120' },
    { id: 'mixed-nuts', title: 'Mixed Nuts', description: 'Roasted nut mix', price: '₱150' },
    { id: 'cheese-platter', title: 'Cheese Platter', description: 'Selection of cheeses', price: '₱300' }
  ],
  laundry: [
    { id: 'wash-dry', title: 'Wash & Dry', description: 'Clothes washed and dried', price: '₱220' },
    { id: 'iron-only', title: 'Iron Only', description: 'Items pressed and folded', price: '₱180' },
    { id: 'dry-clean', title: 'Dry Clean', description: 'Premium dry-clean service', price: '₱320' },
    { id: 'delicates', title: 'Delicates', description: 'Gentle wash for delicates', price: '₱260' },
    { id: 'linen-change', title: 'Linen Change', description: 'Fresh linen delivered', price: '₱250' },
    { id: 'shoe-polish', title: 'Shoe Polish', description: 'Shoe shine service', price: '₱120' },
    { id: 'towel-service', title: 'Towel Service', description: 'Extra towels delivered', price: '₱100' },
    { id: 'pillow-service', title: 'Pillow Service', description: 'Additional pillow delivered', price: '₱130' },
    { id: 'blanket-service', title: 'Blanket Service', description: 'Extra blanket delivered', price: '₱150' }
  ],
  grocery: [
    { id: 'milk', title: 'Fresh Milk', description: '1L whole milk', price: '₱120' },
    { id: 'bread', title: 'Fresh Bread', description: 'Artisan loaf', price: '₱110' },
    { id: 'eggs', title: 'Eggs', description: 'Dozen eggs', price: '₱150' },
    { id: 'butter', title: 'Butter', description: 'Salted butter', price: '₱130' },
    { id: 'fruit-basket', title: 'Fruit Basket', description: 'Seasonal fruits', price: '₱280' },
    { id: 'water', title: 'Bottled Water', description: '6-pack bottled water', price: '₱220' },
    { id: 'coffee', title: 'Ground Coffee', description: 'Medium roast coffee', price: '₱190' },
    { id: 'tea', title: 'Tea Selection', description: 'Herbal tea assortment', price: '₱160' },
    { id: 'snacks', title: 'Snack Pack', description: 'Mixed snack pack', price: '₱200' }
  ]
}

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

// live bookings state will replace the previous mock data

function formatStayRange(checkIn, checkOut) {
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  return `${a.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} → ${b.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export default function GuestPortal({ onNavigate, onBack, user, onLogout }) {
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState('')
  const [showModifyForm, setShowModifyForm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showRoomService, setShowRoomService] = useState(false)
  const [showHousekeeping, setShowHousekeeping] = useState(false)
  const [modifyDates, setModifyDates] = useState({ checkIn: '', checkOut: '' })
  const [serviceRequest, setServiceRequest] = useState({
    type: 'room_service',
    description: '',
    itemsOrdered: []
  })
  const [leaveAtDoor, setLeaveAtDoor] = useState(false)
  const [housekeepingRequest, setHousekeepingRequest] = useState({
    type: 'cleaning',
    description: '',
    priority: 'normal',
    requestedTime: ''
  })
  const [serviceRequests, setServiceRequests] = useState([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [serviceError, setServiceError] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [portalNotice, setPortalNotice] = useState(null)

  const supabaseLive = isSupabaseConfigured()
  const activeBooking = bookings.find((booking) => {
    const s = String(booking.status).toLowerCase()
    return s === 'confirmed' || s === 'pending' || s === 'active'
  })
  const defaultBookingId = activeBooking?.bookingId ?? null

  const loadBookings = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase || !user || !user.email) {
      setBookings([])
      return
    }

    setBookingsLoading(true)
    setBookingsError('')
    try {
      const email = String(user.email).trim().toLowerCase()
      console.log('[GuestPortal] Loading bookings for email:', email)
      
      // Since guests table doesn't exist and bookings don't have email column yet,
      // we can't directly query by guest email. Show guidance to user.
      // In the future, when bookings have a guestemail column, we can query by that.
      let bookingRows = null
      
      // Try to query by guestemail (for bookings made by guests with email stored)
      try {
        const { data, error } = await supabase.from('bookings').select('*').ilike('guestemail', email)
        console.log('[GuestPortal] Bookings by guestemail:', { error: error?.message, dataCount: data?.length ?? 0 })
        if (!error && Array.isArray(data) && data.length) {
          bookingRows = data
        }
      } catch (e) {
        console.log('[GuestPortal] guestemail column not available:', e.message)
      }
      
      if (!bookingRows || !bookingRows.length) {
        // Fallback: No bookings found - this is expected if the schema isn't set up properly
        console.log('[GuestPortal] No bookings found. Schema may need guestemail column in bookings table.')
        bookingRows = []
      }

      const rows = bookingRows ?? []

      // attempt to load room labels (room number and type) when bookings reference room IDs
      const roomIdSet = new Set()
      for (const r of rows) {
        const rid = pick(r, 'roomid', 'room_id')
        if (rid != null) roomIdSet.add(String(rid))
      }

      const roomMap = new Map()
      if (roomIdSet.size > 0) {
        try {
          const { data: roomRows, error: roomErr } = await supabase.from('rooms').select('*').in('roomid', [...roomIdSet])
          if (!roomErr && Array.isArray(roomRows)) {
            for (const row of roomRows) {
              const id = pick(row, 'roomid', 'room_id')
              const number = pick(row, 'roomnumber', 'room_number') ?? id
              const type = pick(row, 'roomtype', 'room_type') ?? ''
              roomMap.set(String(id), { number, type })
              roomMap.set(String(number), { number, type })
            }
          }
        } catch (e) {
          // ignore room lookup errors
        }
      }

      const mapped = (rows || []).map((r) => {
        const rid = pick(r, 'roomid', 'room_id')
        const rawRoomNum = pick(r, 'roomnumber', 'room_number', 'room') ?? (rid != null ? String(rid) : '—')
        const roomInfo = roomMap.get(String(rid)) ?? roomMap.get(String(rawRoomNum))
        const roomLabel = roomInfo ? `${roomInfo.number} — ${roomInfo.type || ''}`.trim() : rawRoomNum

        return {
          id: String(pick(r, 'bookingid', 'booking_id', 'id') ?? ''),
          bookingId: Number(pick(r, 'bookingid', 'booking_id', 'id')) || null,
          roomNumber: roomLabel,
          roomType: pick(r, 'roomtype', 'room_type') ?? (roomInfo?.type ?? ''),
          checkIn: pick(r, 'checkindate', 'check_in_date', 'checkin_date') ?? pick(r, 'checkin') ?? '',
          checkOut: pick(r, 'checkoutdate', 'check_out_date', 'checkout_date') ?? pick(r, 'checkout') ?? '',
          status: (() => {
            const s = pick(r, 'status')
            if (!s) return 'Active'
            const sl = String(s).toLowerCase()
            return sl === 'pending' ? 'Active' : s
          })(),
          guestName: pick(r, 'guestname', 'guest_name', 'name') ?? user.email ?? 'Guest',
          price: pick(r, 'total', 'price') ?? '',
          hasDigitalKey: Boolean(pick(r, 'has_digital_key', 'hasdigitalkey', 'digital_key'))
        }
      })

      setBookings(mapped)
    } catch (err) {
      setBookingsError(err?.message || String(err))
      setBookings([])
    } finally {
      setBookingsLoading(false)
    }
  }, [user])

  const showNotice = useCallback((text, type = 'success') => {
    setPortalNotice({ text, type })
  }, [])

  const loadServiceRequests = useCallback(async () => {
    if (!supabaseLive) {
      setServiceRequests([])
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      setServiceRequests([])
      return
    }

    setLoadingServices(true)
    setServiceError('')
    try {
      const { data, error } = await supabase
        .from('servicerequests')
        .select('*')
        .order('requestedat', { ascending: false })
        .limit(100)
      if (error) throw error
      setServiceRequests(data ?? [])
    } catch (err) {
      setServiceError(err.message || String(err))
      setServiceRequests([])
    } finally {
      setLoadingServices(false)
    }
  }, [supabaseLive])

  const createServiceRequest = useCallback(
    async ({ servicetype, notes }) => {
      if (!supabaseLive) {
        showNotice('Supabase is not configured. Service requests are only simulated.', 'info')
        return false
      }

      const supabase = getSupabase()
      if (!supabase) {
        showNotice('Supabase client is not available.', 'error')
        return false
      }

      setRequestLoading(true)
      setServiceError('')
      try {
        const payload = {
          servicetype,
          status: 'active',
          notes: notes ? String(notes).trim() : null,
          requestedat: new Date().toISOString()
        }
        const bookingId = selectedBooking?.bookingId ?? defaultBookingId
        if (bookingId != null) {
          payload.bookingid = bookingId
        }

        const { error } = await supabase.from('servicerequests').insert(payload)
        if (error) throw error
        await loadServiceRequests()
        return true
      } catch (err) {
        setServiceError(err.message || String(err))
        return false
      } finally {
        setRequestLoading(false)
      }
    },
    [defaultBookingId, loadServiceRequests, selectedBooking, showNotice, supabaseLive]
  )

  useEffect(() => {
    if (!portalNotice) return undefined
    const t = setTimeout(() => setPortalNotice(null), 7000)
    return () => clearTimeout(t)
  }, [portalNotice])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (showCancelConfirm) setShowCancelConfirm(false)
      else if (showModifyForm) setShowModifyForm(false)
      else if (showRoomService) setShowRoomService(false)
      else if (showHousekeeping) setShowHousekeeping(false)
      else if (selectedBooking) setSelectedBooking(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showCancelConfirm, showModifyForm, showRoomService, showHousekeeping, selectedBooking])

  useEffect(() => {
    if (!supabaseLive) return
    void loadServiceRequests()
    void loadBookings()
  }, [loadServiceRequests, loadBookings, supabaseLive])

  const guestEmail = user?.email ?? user?.name ?? 'Guest'

  return (
    <div className="page-content guest-portal-page">
      <header className="guest-portal-header">
        <div className="guest-portal-header-left">
          <button type="button" className="back-btn" onClick={onBack}>
            ← Back to home
          </button>
          <div>
            <h2>Guest portal</h2>
            <p className="guest-portal-signed-in">
              Signed in as <strong>{guestEmail}</strong>
            </p>
          </div>
        </div>
        {onLogout && (
          <button type="button" className="guest-portal-signout" onClick={onLogout}>
            Sign out
          </button>
        )}
      </header>

      {portalNotice && (
        <div
          className={`guest-portal-notice guest-portal-notice--${portalNotice.type}`}
          role="status"
        >
          {portalNotice.text}
        </div>
      )}

      <div className="guest-portal-quick">
        <button type="button" className="guest-portal-chip" onClick={() => onNavigate('roombooking', {})}>
          Book a room
        </button>
        <button type="button" className="guest-portal-chip guest-portal-chip--ghost" onClick={() => onNavigate('feedback')}>
          Leave feedback
        </button>
      </div>

      <section className="bookings-container" aria-labelledby="gp-bookings-title">
        <div className="guest-portal-section-head">
          <h3 id="gp-bookings-title">Your stays</h3>
          <span className="guest-portal-section-hint">
            {!supabaseLive
              ? 'Supabase not configured; live bookings unavailable.'
              : bookingsLoading
              ? 'Loading your bookings…'
              : bookingsError
              ? `Error: ${bookingsError}`
              : bookings.length === 0
              ? 'No bookings found. Ensure your email was used when booking and the database schema includes the guestemail column.'
              : 'Tap a card for details.'}
          </span>
        </div>
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <button
              key={booking.id}
              type="button"
              className={`booking-card ${booking.status.toLowerCase()}`}
              onClick={() => setSelectedBooking(booking)}
            >
              <div className="booking-header">
                <span className="booking-id">{booking.id}</span>
                <span className={`booking-status ${booking.status.toLowerCase()}`}>{booking.status}</span>
              </div>
              <div className="booking-info">
                <p>
                  <strong>
                    Room {booking.roomNumber}
                  </strong>{' '}
                  · {booking.roomType}
                </p>
                <p className="dates">{formatStayRange(booking.checkIn, booking.checkOut)}</p>
                <p className="price">{booking.price}</p>
              </div>
              {booking.hasDigitalKey && <div className="digital-key-badge">Digital key available</div>}
            </button>
          ))}
        </div>
      </section>

      <section className="services-container" aria-labelledby="gp-services-title">
        <div className="guest-portal-section-head">
          <h3 id="gp-services-title">Guest services</h3>
          <span className="guest-portal-section-hint">
            {supabaseLive
              ? 'Requests are stored in Supabase when connected.'
              : 'Supabase not configured; service requests are shown only as simulation.'}
          </span>
        </div>
        <div className="services-grid">
          <button type="button" className="service-card" onClick={() => setShowRoomService(true)}>
            <span className="service-icon" aria-hidden="true">
              🍽️
            </span>
            <h4>Room service</h4>
            <p>Food, mini bar, laundry, and grocery-style items</p>
          </button>
          <button type="button" className="service-card" onClick={() => setShowHousekeeping(true)}>
            <span className="service-icon" aria-hidden="true">
              🧹
            </span>
            <h4>Housekeeping</h4>
            <p>Cleaning, linen, and priority requests</p>
          </button>
          <button
            type="button"
            className="service-card"
            onClick={async () => {
              const success = await createServiceRequest({
                servicetype: 'maintenance',
                notes: 'Guest requested maintenance from the portal.'
              })
              if (success) showNotice('Maintenance request submitted.', 'success')
            }}
          >
            <span className="service-icon" aria-hidden="true">
              🔧
            </span>
            <h4>Maintenance</h4>
            <p>Report an issue in your room</p>
          </button>
          <button
            type="button"
            className="service-card"
            onClick={async () => {
              const success = await createServiceRequest({
                servicetype: 'concierge',
                notes: 'Guest requested concierge assistance from the portal.'
              })
              if (success) showNotice('Concierge request submitted.', 'success')
            }}
          >
            <span className="service-icon" aria-hidden="true">
              📞
            </span>
            <h4>Concierge</h4>
            <p>Help with local tips and reservations</p>
          </button>
        </div>
      </section>

      {selectedBooking && (
        <div
          className="guest-portal-overlay booking-detail-modal"
          role="presentation"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="modal-content guest-portal-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gp-detail-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="close-modal guest-portal-close" onClick={() => setSelectedBooking(null)} aria-label="Close">
              ✕
            </button>

            <h3 id="gp-detail-title">Booking details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Booking ID</label>
                <p>{selectedBooking.id}</p>
              </div>
              <div className="detail-item">
                <label>Room</label>
                <p>
                  {selectedBooking.roomNumber} ({selectedBooking.roomType})
                </p>
              </div>
              <div className="detail-item">
                <label>Check-in</label>
                <p>{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Check-out</label>
                <p>{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Total</label>
                <p>{selectedBooking.price}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <p className={selectedBooking.status.toLowerCase()}>{selectedBooking.status}</p>
              </div>
            </div>

            <div className="booking-actions">
              {selectedBooking.hasDigitalKey && selectedBooking.status === 'Confirmed' && (
                <button type="button" className="action-btn digital-key-btn" onClick={() => onNavigate('digitalkeys')}>
                  Get digital key
                </button>
              )}
              {selectedBooking.status === 'Completed' && (
                <button type="button" className="action-btn feedback-btn" onClick={() => onNavigate('feedback')}>
                  Leave feedback
                </button>
              )}
              {(selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Pending' || selectedBooking.status === 'Active') && (
                <>
                  <button
                    type="button"
                    className="action-btn pay-btn"
                    onClick={() => {
                      // Save booking info so the checkout page can pick it up
                      const bookingId = selectedBooking.bookingId ?? selectedBooking.id
                      const amount = parseFloat(String(selectedBooking.price).replace(/[^0-9.]/g, ''))
                      sessionStorage.setItem('stripeCheckoutBookingId', String(bookingId))
                      sessionStorage.setItem('stripeCheckoutBookingData', JSON.stringify({ bookingId, totalamount: amount, price: selectedBooking.price }))
                      onNavigate('guestcheckout')
                    }}
                  >
                    Pay & check out
                  </button>
                  <button
                    type="button"
                    className="action-btn modify-btn"
                    onClick={() => {
                      setModifyDates({ checkIn: selectedBooking.checkIn, checkOut: selectedBooking.checkOut })
                      setShowModifyForm(true)
                    }}
                  >
                    Modify dates
                  </button>
                  <button type="button" className="action-btn cancel-btn" onClick={() => setShowCancelConfirm(true)}>
                    Cancel booking
                  </button>
                </>
              )}
              <button type="button" className="action-btn secondary" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModifyForm && selectedBooking && (
        <div className="guest-portal-overlay modal-overlay" role="presentation" onClick={() => setShowModifyForm(false)}>
          <div className="modal-content small guest-portal-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close-modal guest-portal-close" onClick={() => setShowModifyForm(false)} aria-label="Close">
              ✕
            </button>
            <h3>Modify booking</h3>
            <p className="guest-portal-modal-lead">Request new dates for {selectedBooking.id}. This demo does not save changes.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                showNotice(
                  `Request recorded for ${selectedBooking.id}: ${new Date(modifyDates.checkIn).toLocaleDateString()} – ${new Date(modifyDates.checkOut).toLocaleDateString()}.`,
                  'success'
                )
                setShowModifyForm(false)
                setSelectedBooking(null)
              }}
            >
              <div className="form-group">
                <label htmlFor="gp-mod-in">New check-in</label>
                <input
                  id="gp-mod-in"
                  type="date"
                  value={modifyDates.checkIn}
                  onChange={(e) => setModifyDates({ ...modifyDates, checkIn: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gp-mod-out">New check-out</label>
                <input
                  id="gp-mod-out"
                  type="date"
                  value={modifyDates.checkOut}
                  onChange={(e) => setModifyDates({ ...modifyDates, checkOut: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                Submit request
              </button>
            </form>
          </div>
        </div>
      )}

      {showCancelConfirm && selectedBooking && (
        <div className="guest-portal-overlay modal-overlay" role="presentation" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal-content small guest-portal-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="close-modal guest-portal-close" onClick={() => setShowCancelConfirm(false)} aria-label="Close">
              ✕
            </button>
            <h3>Cancel booking</h3>
            <p>
              Cancel <strong>{selectedBooking.id}</strong>? This cannot be undone in a live system.
            </p>
            <div className="cancellation-policy">
              <h4>Cancellation policy</h4>
              <ul>
                <li>Free cancellation up to 48 hours before check-in</li>
                <li>Late cancellation may incur one night&apos;s charge</li>
                <li>No-shows may be charged the full stay</li>
              </ul>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  showNotice(`Booking ${selectedBooking.id} has been cancelled (demo).`, 'success')
                  setShowCancelConfirm(false)
                  setSelectedBooking(null)
                }}
              >
                Yes, cancel
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowCancelConfirm(false)}>
                Keep booking
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoomService && (
        <div className="guest-portal-overlay modal-overlay" role="presentation" onClick={() => setShowRoomService(false)}>
          <div className="modal-content medium guest-portal-sheet guest-portal-sheet--wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="close-modal guest-portal-close" onClick={() => setShowRoomService(false)} aria-label="Close">
              ✕
            </button>
            <h3>Room service</h3>
            <p className="guest-portal-modal-lead">Select items, add notes, and place a demo order.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!serviceRequest.itemsOrdered.length) {
                  showNotice('Please select at least one item.', 'info')
                  return
                }

                const summary = serviceRequest.itemsOrdered
                  .map((id) => roomServiceMenu[serviceRequest.type].find((item) => item.id === id)?.title ?? id)
                  .join(', ')
                const notes = [
                  `Category: ${serviceRequest.type.replace('_', ' ')}`,
                  summary,
                  serviceRequest.description,
                  leaveAtDoor ? 'Leave at door.' : null
                ]
                  .filter(Boolean)
                  .join(' | ')
                const serviceType = serviceRequest.type

                if (!supabaseLive) {
                  showNotice(
                    `Room service request simulated (${serviceRequest.itemsOrdered.length} item(s)).`,
                    'info'
                  )
                  setShowRoomService(false)
                  setServiceRequest({ type: 'room_service', description: '', itemsOrdered: [] })
                  setLeaveAtDoor(false)
                  return
                }

                const success = await createServiceRequest({
                  servicetype: serviceType,
                  notes
                })
                if (success) {
                  showNotice('Room service request submitted.', 'success')
                  setShowRoomService(false)
                  setServiceRequest({ type: 'room_service', description: '', itemsOrdered: [] })
                  setLeaveAtDoor(false)
                }
              }}
            >
              <div className="form-group">
                <label htmlFor="gp-rs-type">Category</label>
                <select
                  id="gp-rs-type"
                  value={serviceRequest.type}
                  onChange={(e) =>
                    setServiceRequest({
                      ...serviceRequest,
                      type: e.target.value,
                      itemsOrdered: []
                    })
                  }
                >
                  <option value="room_service">Food & beverages</option>
                  <option value="mini_bar">Mini bar</option>
                  <option value="laundry">Laundry</option>
                  <option value="grocery">Grocery</option>
                </select>
              </div>
              <div className="service-item-grid">
                {roomServiceMenu[serviceRequest.type].map((item) => {
                  const selected = serviceRequest.itemsOrdered.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`room-service-item-card ${selected ? 'selected' : ''}`}
                      onClick={() => {
                        const nextItems = selected
                          ? serviceRequest.itemsOrdered.filter((id) => id !== item.id)
                          : [...serviceRequest.itemsOrdered, item.id]
                        setServiceRequest({ ...serviceRequest, itemsOrdered: nextItems })
                      }}
                    >
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                      <span className="item-price">{item.price}</span>
                    </button>
                  )
                })}
              </div>
              <div className="selected-items-summary">
                <p>
                  Selected: <strong>{serviceRequest.itemsOrdered.length}</strong>
                </p>
                {serviceRequest.itemsOrdered.length > 0 && (
                  <ul>
                    {roomServiceMenu[serviceRequest.type]
                      .filter((item) => serviceRequest.itemsOrdered.includes(item.id))
                      .map((item) => (
                        <li key={item.id}>
                          {item.title} — {item.price}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="gp-rs-notes">Special requests</label>
                <textarea
                  id="gp-rs-notes"
                  value={serviceRequest.description}
                  onChange={(e) => setServiceRequest({ ...serviceRequest, description: e.target.value })}
                  placeholder="Allergies, delivery instructions…"
                  rows={3}
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="guest-portal-checkbox">
                  <input type="checkbox" checked={leaveAtDoor} onChange={(e) => setLeaveAtDoor(e.target.checked)} />
                  Leave at door (do not disturb)
                </label>
              </div>
              <button type="submit" className="btn-primary" disabled={requestLoading}>
                {requestLoading ? 'Submitting…' : 'Place order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showHousekeeping && (
        <div className="guest-portal-overlay modal-overlay" role="presentation" onClick={() => setShowHousekeeping(false)}>
          <div className="modal-content medium guest-portal-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="close-modal guest-portal-close" onClick={() => setShowHousekeeping(false)} aria-label="Close">
              ✕
            </button>
            <h3>Housekeeping</h3>
            <p className="guest-portal-modal-lead">Tell us what you need; this demo only shows a confirmation.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const notes = [
                  housekeepingRequest.description,
                  `Priority: ${housekeepingRequest.priority}`,
                  housekeepingRequest.requestedTime ? `Preferred time: ${housekeepingRequest.requestedTime}` : null
                ]
                  .filter(Boolean)
                  .join(' | ')

                if (!supabaseLive) {
                  showNotice('Housekeeping request simulated. The team will follow up (demo).', 'info')
                  setShowHousekeeping(false)
                  setHousekeepingRequest({ type: 'cleaning', description: '', priority: 'normal', requestedTime: '' })
                  return
                }

                const success = await createServiceRequest({
                  servicetype: 'housekeeping',
                  notes: `Type: ${housekeepingRequest.type} | ${notes}`
                })
                if (success) {
                  showNotice('Housekeeping request submitted.', 'success')
                  setShowHousekeeping(false)
                  setHousekeepingRequest({ type: 'cleaning', description: '', priority: 'normal', requestedTime: '' })
                }
              }}
            >
              <div className="form-group">
                <label htmlFor="gp-hk-type">Service type</label>
                <select
                  id="gp-hk-type"
                  value={housekeepingRequest.type}
                  onChange={(e) => setHousekeepingRequest({ ...housekeepingRequest, type: e.target.value })}
                >
                  <option value="cleaning">Room cleaning</option>
                  <option value="linen">Linen change</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="waste">Waste removal</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="gp-hk-priority">Priority</label>
                <select
                  id="gp-hk-priority"
                  value={housekeepingRequest.priority}
                  onChange={(e) => setHousekeepingRequest({ ...housekeepingRequest, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="gp-hk-desc">Description</label>
                <textarea
                  id="gp-hk-desc"
                  value={housekeepingRequest.description}
                  onChange={(e) => setHousekeepingRequest({ ...housekeepingRequest, description: e.target.value })}
                  placeholder="What should we do in your room?"
                  rows={4}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gp-hk-time">Preferred time (optional)</label>
                <input
                  id="gp-hk-time"
                  type="time"
                  value={housekeepingRequest.requestedTime}
                  onChange={(e) => setHousekeepingRequest({ ...housekeepingRequest, requestedTime: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={requestLoading}>
                {requestLoading ? 'Submitting…' : 'Submit request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
