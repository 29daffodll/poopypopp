import { useState } from 'react'

export default function CancelBooking({ onBack }) {
  const [cancelData, setCancelData] = useState({
    bookingId: '',
    guestName: '',
    cancellationReason: ''
  })

  const [bookings] = useState([
    { id: 'B001', guestName: 'John Doe', roomNumber: 101 },
    { id: 'B002', guestName: 'Jane Smith', roomNumber: 102 },
    { id: 'B003', guestName: 'Bob Johnson', roomNumber: 105 },
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    setCancelData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Booking ${cancelData.bookingId} cancelled successfully`)
    setCancelData({ bookingId: '', guestName: '', cancellationReason: '' })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Cancel Booking</h2>
      </div>
      
      <div className="bookings-list">
        <h3>Active Bookings</h3>
        <ul>
          {bookings.map(booking => (
            <li key={booking.id}>
              {booking.id} - {booking.guestName} (Room {booking.roomNumber})
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="page-form">
        <div className="form-group">
          <label>Booking ID</label>
          <input
            type="text"
            name="bookingId"
            value={cancelData.bookingId}
            onChange={handleChange}
            placeholder="e.g., B001"
            required
          />
        </div>
        <div className="form-group">
          <label>Guest Name</label>
          <input
            type="text"
            name="guestName"
            value={cancelData.guestName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Cancellation Reason</label>
          <textarea
            name="cancellationReason"
            value={cancelData.cancellationReason}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>
        <button type="submit" className="submit-btn">Cancel Booking</button>
      </form>
    </div>
  )
}
