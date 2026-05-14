import { useCallback, useEffect, useState } from 'react'

const roomServiceMenu = {
  food: [
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
  'mini-bar': [
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

const mockBookings = [
  {
    id: 'BK001',
    roomNumber: 101,
    roomType: 'Suite',
    checkIn: '2026-04-27',
    checkOut: '2026-04-30',
    status: 'Confirmed',
    guestName: 'John Doe',
    price: '$750',
    hasDigitalKey: true
  },
  {
    id: 'BK002',
    roomNumber: 205,
    roomType: 'Double',
    checkIn: '2026-05-05',
    checkOut: '2026-05-08',
    status: 'Pending',
    guestName: 'Jane Smith',
    price: '$450',
    hasDigitalKey: false
  },
  {
    id: 'BK003',
    roomNumber: 103,
    roomType: 'Single',
    checkIn: '2026-04-20',
    checkOut: '2026-04-25',
    status: 'Completed',
    guestName: 'Bob Johnson',
    price: '$500',
    hasDigitalKey: false
  }
]

function formatStayRange(checkIn, checkOut) {
  const a = new Date(checkIn)
  const b = new Date(checkOut)
  return `${a.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} → ${b.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export default function GuestPortal({ onNavigate, onBack, user, onLogout }) {
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModifyForm, setShowModifyForm] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showRoomService, setShowRoomService] = useState(false)
  const [showHousekeeping, setShowHousekeeping] = useState(false)
  const [modifyDates, setModifyDates] = useState({ checkIn: '', checkOut: '' })
  const [serviceRequest, setServiceRequest] = useState({
    type: 'food',
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
  const [portalNotice, setPortalNotice] = useState(null)

  const showNotice = useCallback((text, type = 'success') => {
    setPortalNotice({ text, type })
  }, [])

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

      <p className="guest-portal-intro">
        View demo reservations below, open a stay for details, or use guest services. Live booking data can be wired
        to Supabase the same way as staff tools when you are ready.
      </p>

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
          <span className="guest-portal-section-hint">Demo data — tap a card for details</span>
        </div>
        <div className="bookings-grid">
          {mockBookings.map((booking) => (
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
          <span className="guest-portal-section-hint">Requests are simulated in this build</span>
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
            onClick={() => showNotice('Maintenance requests are routed to the front desk in a full deployment.', 'info')}
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
            onClick={() => showNotice('Concierge chat and bookings are not connected in this demo.', 'info')}
          >
            <span className="service-icon" aria-hidden="true">
              📞
            </span>
            <h4>Concierge</h4>
            <p>Help with local tips and reservations</p>
          </button>
        </div>
        <div className="service-requests">
          <h4>Recent requests</h4>
          <p className="no-requests">No active service requests</p>
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
              {(selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Pending') && (
                <>
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
              onSubmit={(e) => {
                e.preventDefault()
                showNotice(
                  serviceRequest.itemsOrdered.length
                    ? `Order placed (${serviceRequest.itemsOrdered.length} item(s)). Estimated delivery 30–45 minutes (demo).`
                    : 'Please select at least one item.',
                  serviceRequest.itemsOrdered.length ? 'success' : 'info'
                )
                if (!serviceRequest.itemsOrdered.length) return
                setShowRoomService(false)
                setServiceRequest({ type: 'food', description: '', itemsOrdered: [] })
                setLeaveAtDoor(false)
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
                  <option value="food">Food &amp; beverages</option>
                  <option value="mini-bar">Mini bar</option>
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
              <button type="submit" className="btn-primary">
                Place order
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
              onSubmit={(e) => {
                e.preventDefault()
                showNotice('Housekeeping request received. The team will follow up (demo).', 'success')
                setShowHousekeeping(false)
                setHousekeepingRequest({ type: 'cleaning', description: '', priority: 'normal', requestedTime: '' })
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
              <button type="submit" className="btn-primary">
                Submit request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
