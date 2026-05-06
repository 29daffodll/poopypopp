import { useState } from 'react'

export default function GuestPortal({ onNavigate, onBack }) {
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
  const [housekeepingRequest, setHousekeepingRequest] = useState({
    type: 'cleaning',
    description: '',
    priority: 'normal',
    requestedTime: ''
  })

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

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Guest Portal</h2>
      </div>

      <div className="bookings-container">
        <h3>Your Bookings</h3>
        <div className="bookings-grid">
          {mockBookings.map(booking => (
            <div
              key={booking.id}
              className={`booking-card ${booking.status.toLowerCase()}`}
              onClick={() => setSelectedBooking(booking)}
            >
              <div className="booking-header">
                <span className="booking-id">{booking.id}</span>
                <span className={`booking-status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-info">
                <p><strong>Room {booking.roomNumber}</strong> - {booking.roomType}</p>
                <p className="dates">
                  📅 {new Date(booking.checkIn).toLocaleDateString()} → {new Date(booking.checkOut).toLocaleDateString()}
                </p>
                <p className="price">{booking.price}</p>
              </div>
              {booking.hasDigitalKey && (
                <div className="digital-key-badge">🔑 Digital Key Available</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="services-container">
        <h3>Guest Services</h3>
        <div className="services-grid">
          <div className="service-card" onClick={() => setShowRoomService(true)}>
            <div className="service-icon">🍽️</div>
            <h4>Room Service</h4>
            <p>Order food and beverages to your room</p>
          </div>
          <div className="service-card" onClick={() => setShowHousekeeping(true)}>
            <div className="service-icon">🧹</div>
            <h4>Housekeeping</h4>
            <p>Request cleaning and maintenance services</p>
          </div>
          <div className="service-card">
            <div className="service-icon">🔧</div>
            <h4>Maintenance</h4>
            <p>Report room issues or request repairs</p>
          </div>
          <div className="service-card">
            <div className="service-icon">📞</div>
            <h4>Concierge</h4>
            <p>Assistance with reservations and information</p>
          </div>
        </div>
        <div className="service-requests">
          <h4>Recent Service Requests</h4>
          <p className="no-requests">No active service requests</p>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="booking-detail-modal">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setSelectedBooking(null)}>✕</button>

            <h3>Booking Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Booking ID</label>
                <p>{selectedBooking.id}</p>
              </div>
              <div className="detail-item">
                <label>Room</label>
                <p>{selectedBooking.roomNumber} ({selectedBooking.roomType})</p>
              </div>
              <div className="detail-item">
                <label>Check In</label>
                <p>{new Date(selectedBooking.checkIn).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Check Out</label>
                <p>{new Date(selectedBooking.checkOut).toLocaleDateString()}</p>
              </div>
              <div className="detail-item">
                <label>Total Price</label>
                <p>{selectedBooking.price}</p>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <p className={selectedBooking.status.toLowerCase()}>{selectedBooking.status}</p>
              </div>
            </div>

            <div className="booking-actions">
              {selectedBooking.hasDigitalKey && selectedBooking.status === 'Confirmed' && (
                <button className="action-btn digital-key-btn" onClick={() => onNavigate('digitalkeys')}>
                  🔑 Get Digital Key
                </button>
              )}
              {selectedBooking.status === 'Completed' && (
                <button className="action-btn feedback-btn" onClick={() => onNavigate('feedback')}>
                  ⭐ Leave Feedback
                </button>
              )}
              {(selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Pending') && (
                <>
                  <button className="action-btn modify-btn" onClick={() => {
                    setModifyDates({ checkIn: selectedBooking.checkIn, checkOut: selectedBooking.checkOut })
                    setShowModifyForm(true)
                  }}>
                    ✏️ Modify Booking
                  </button>
                  <button className="action-btn cancel-btn" onClick={() => setShowCancelConfirm(true)}>
                    ❌ Cancel Booking
                  </button>
                </>
              )}
              <button className="action-btn secondary" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modify Booking Form */}
      {showModifyForm && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModifyForm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowModifyForm(false)}>✕</button>
            <h3>Modify Booking</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              alert(`Booking ${selectedBooking.id} modification request submitted!\n\nNew dates:\n${new Date(modifyDates.checkIn).toLocaleDateString()} - ${new Date(modifyDates.checkOut).toLocaleDateString()}`)
              setShowModifyForm(false)
            }}>
              <div className="form-group">
                <label>New Check-in Date</label>
                <input
                  type="date"
                  value={modifyDates.checkIn}
                  onChange={(e) => setModifyDates({...modifyDates, checkIn: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Check-out Date</label>
                <input
                  type="date"
                  value={modifyDates.checkOut}
                  onChange={(e) => setModifyDates({...modifyDates, checkOut: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">Submit Modification Request</button>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation */}
      {showCancelConfirm && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowCancelConfirm(false)}>✕</button>
            <h3>Cancel Booking</h3>
            <p>Are you sure you want to cancel booking <strong>{selectedBooking.id}</strong>?</p>
            <div className="cancellation-policy">
              <h4>Cancellation Policy</h4>
              <ul>
                <li>Free cancellation up to 48 hours before check-in</li>
                <li>Late cancellation will incur a fee of 1 night's stay</li>
                <li>No-show will be charged the full booking amount</li>
              </ul>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-danger" 
                onClick={() => {
                  alert(`Booking ${selectedBooking.id} cancelled successfully!`)
                  setShowCancelConfirm(false)
                  setSelectedBooking(null)
                }}
              >
                Yes, Cancel Booking
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Service Order */}
      {showRoomService && (
        <div className="modal-overlay" onClick={() => setShowRoomService(false)}>
          <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowRoomService(false)}>✕</button>
            <h3>🍽️ Room Service Order</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              alert('Room service order submitted! Delivery in 30-45 minutes.')
              setShowRoomService(false)
              setServiceRequest({ type: 'food', description: '', itemsOrdered: [] })
            }}>
              <div className="form-group">
                <label>Service Type</label>
                <select
                  value={serviceRequest.type}
                  onChange={(e) => setServiceRequest({
                    ...serviceRequest,
                    type: e.target.value,
                    itemsOrdered: []
                  })}
                >
                  <option value="food">Food & Beverages</option>
                  <option value="mini-bar">Mini Bar</option>
                  <option value="laundry">Laundry</option>
                  <option value="grocery">Grocery Items</option>
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
                  Selected items: <strong>{serviceRequest.itemsOrdered.length}</strong>
                </p>
                {serviceRequest.itemsOrdered.length > 0 && (
                  <ul>
                    {roomServiceMenu[serviceRequest.type]
                      .filter((item) => serviceRequest.itemsOrdered.includes(item.id))
                      .map((item) => (
                        <li key={item.id}>{item.title} — {item.price}</li>
                      ))}
                  </ul>
                )}
              </div>
              <div className="form-group">
                <label>Special Requests / Instructions</label>
                <textarea
                  value={serviceRequest.description}
                  onChange={(e) => setServiceRequest({...serviceRequest, description: e.target.value})}
                  placeholder="Add notes like extra napkins, allergies, delivery preferences..."
                  rows="4"
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" /> Do not disturb (Leave at door)
                </label>
              </div>
              <button type="submit" className="btn-primary">Place Order</button>
            </form>
          </div>
        </div>
      )}

      {/* Housekeeping Request */}
      {showHousekeeping && (
        <div className="modal-overlay" onClick={() => setShowHousekeeping(false)}>
          <div className="modal-content medium" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowHousekeeping(false)}>✕</button>
            <h3>🧹 Housekeeping Request</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              alert('Housekeeping request submitted! Team will arrive shortly.')
              setShowHousekeeping(false)
              setHousekeepingRequest({ type: 'cleaning', description: '', priority: 'normal', requestedTime: '' })
            }}>
              <div className="form-group">
                <label>Service Type</label>
                <select value={housekeepingRequest.type} onChange={(e) => setHousekeepingRequest({...housekeepingRequest, type: e.target.value})}>
                  <option value="cleaning">Room Cleaning</option>
                  <option value="linen">Linen Change</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="waste">Waste Removal</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={housekeepingRequest.priority} onChange={(e) => setHousekeepingRequest({...housekeepingRequest, priority: e.target.value})}>
                  <option value="low">Low - Can wait a few hours</option>
                  <option value="normal">Normal - Standard response time</option>
                  <option value="high">High - Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={housekeepingRequest.description}
                  onChange={(e) => setHousekeepingRequest({...housekeepingRequest, description: e.target.value})}
                  placeholder="Describe what needs to be done..."
                  rows="4"
                  required
                />
              </div>
              <div className="form-group">
                <label>Requested Time (Optional)</label>
                <input
                  type="time"
                  value={housekeepingRequest.requestedTime}
                  onChange={(e) => setHousekeepingRequest({...housekeepingRequest, requestedTime: e.target.value})}
                />
              </div>
              <button type="submit" className="btn-primary">Submit Request</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
