import { useState } from 'react'

export default function GuestPortal({ onNavigate, onBack }) {
  const [selectedBooking, setSelectedBooking] = useState(null)

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
              <button className="action-btn secondary" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
