import { useEffect, useState } from 'react'

const roomOptions = [
  {
    id: 'single',
    title: 'Single Room',
    image: '/rooms/single.jpg',
    description: 'A cozy room perfect for solo travelers or business stays.',
    price: '$100/night',
    details: [
      'Comfortable single bed',
      'Ensuite bathroom with shower',
      'Free Wi-Fi and work desk',
      'Complimentary tea and coffee'
    ],
    reviews: {
      averageRating: 4.5,
      totalReviews: 12,
      reviews: [
        { guestName: 'Michael Brown', rating: 5, text: 'Perfect for business trips. Great location.' },
        { guestName: 'John Smith', rating: 4, text: 'Comfortable and clean. Excellent service.' }
      ]
    }
  },
  {
    id: 'double',
    title: 'Double Room',
    image: '/rooms/double.jpg',
    description: 'A spacious double room ideal for couples or friends.',
    price: '$150/night',
    details: [
      'Queen-size bed',
      'Large wardrobe and seating area',
      'Flat-screen TV and minibar',
      'Room service available'
    ],
    reviews: {
      averageRating: 4.7,
      totalReviews: 18,
      reviews: [
        { guestName: 'Emma Johnson', rating: 5, text: 'Spacious and very comfortable. Loved it!' },
        { guestName: 'Sarah Davis', rating: 4, text: 'Nice room with great amenities.' }
      ]
    }
  },
  {
    id: 'suite',
    title: 'Suite',
    image: '/rooms/suite.jpg',
    description: 'A premium suite with generous living space and luxury finishes.',
    price: '$250/night',
    details: [
      'King-size bed with premium linens',
      'Separate living area',
      'Jacuzzi-style bathtub',
      'Complimentary breakfast and lounge access'
    ],
    reviews: {
      averageRating: 4.9,
      totalReviews: 15,
      reviews: [
        { guestName: 'John Smith', rating: 5, text: 'Excellent stay! The suite was spacious and well-maintained.' },
        { guestName: 'Robert Wilson', rating: 5, text: 'Luxury suite with amazing views and service.' }
      ]
    }
  }
]

export default function RoomBooking({ onBack, initialRoomType, initialCheckInDate, initialCheckOutDate }) {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    guestName: '',
    roomType: initialRoomType || 'single',
    checkInDate: initialCheckInDate || '',
    checkOutDate: initialCheckOutDate || '',
    numGuests: 1
  })

  useEffect(() => {
    if (initialRoomType) {
      const room = roomOptions.find((option) => option.id === initialRoomType)
      if (room) {
        setSelectedRoom(room)
        setBookingData((prev) => ({ ...prev, roomType: initialRoomType }))
      }
    }
  }, [initialRoomType])

  useEffect(() => {
    setBookingData((prev) => ({
      ...prev,
      checkInDate: initialCheckInDate || prev.checkInDate,
      checkOutDate: initialCheckOutDate || prev.checkOutDate
    }))
  }, [initialCheckInDate, initialCheckOutDate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setBookingData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoomSelect = (roomId) => {
    const room = roomOptions.find((option) => option.id === roomId)
    setSelectedRoom(room)
    setBookingData(prev => ({ ...prev, roomType: roomId }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Booking confirmed for ${bookingData.guestName} in the ${selectedRoom?.title}`)
    setShowBookingModal(false)
    setSelectedRoom(null)
    setBookingData({ guestName: '', roomType: 'single', checkInDate: '', checkOutDate: '', numGuests: 1 })
  }

  const renderStars = (rating) => {
    return (
      <div className="booking-review-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= Math.round(rating) ? 'filled' : 'empty'}`}>
            ★
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Room Booking</h2>
      </div>

      {!selectedRoom && (
        <>
          <p>Select a room to begin your booking.</p>
          <div className="room-card-grid">
            {roomOptions.map((room) => (
              <button
                key={room.id}
                type="button"
                className="room-card"
                onClick={() => handleRoomSelect(room.id)}
              >
                <div className="room-card-image">
                  <img src={room.image} alt={room.title} />
                </div>
                <div className="room-card-body">
                  <h3>{room.title}</h3>
                  <p>{room.description}</p>
                  <ul className="room-detail-list">
                    {room.details.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {selectedRoom && (
        <>
          <div className="selected-room-header">
            <div className="selected-room-preview">
              <img src={selectedRoom.image} alt={selectedRoom.title} />
            </div>
            <div className="selected-room-info">
              <h3>{selectedRoom.title}</h3>
              <div className="room-price-badge">{selectedRoom.price}</div>
              <p>{selectedRoom.description}</p>
              <ul className="room-detail-list">
                {selectedRoom.details.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className="room-booking-actions">
                <button 
                  className="submit-btn" 
                  onClick={() => setShowBookingModal(true)}
                >
                  CHECK AVAILABILITY
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="booking-reviews-section">
            <h3>Guest Reviews</h3>
            <div className="booking-review-summary">
              {renderStars(selectedRoom.reviews.averageRating)}
              <span className="booking-rating-text">
                {selectedRoom.reviews.averageRating.toFixed(1)}/5 ({selectedRoom.reviews.totalReviews} reviews)
              </span>
            </div>
            <div className="booking-reviews-grid">
              {selectedRoom.reviews.reviews.map((review, idx) => (
                <div key={idx} className="booking-review-card">
                  <div className="booking-review-header">
                    <strong>{review.guestName}</strong>
                    {renderStars(review.rating)}
                  </div>
                  <p>{review.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Modal */}
          {showBookingModal && (
            <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
              <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Complete Your Booking</h2>
                  <button 
                    className="modal-close-btn" 
                    onClick={() => setShowBookingModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="modal-room-summary">
                  <img src={selectedRoom.image} alt={selectedRoom.title} />
                  <div className="modal-room-details">
                    <h3>{selectedRoom.title}</h3>
                    <p className="modal-price">{selectedRoom.price}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                  <div className="form-group">
                    <label>Guest Name *</label>
                    <input
                      type="text"
                      name="guestName"
                      value={bookingData.guestName}
                      onChange={handleChange}
                      required
                    />
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

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setShowBookingModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Confirm Booking
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
