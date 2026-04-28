import { useEffect, useState } from 'react'

const roomOptions = [
  {
    id: 'single',
    title: 'Single Room',
    image: '/rooms/single.jpg',
    description: 'A cozy room perfect for solo travelers or business stays.',
    details: [
      'Comfortable single bed',
      'Ensuite bathroom with shower',
      'Free Wi-Fi and work desk',
      'Complimentary tea and coffee'
    ]
  },
  {
    id: 'double',
    title: 'Double Room',
    image: '/rooms/double.jpg',
    description: 'A spacious double room ideal for couples or friends.',
    details: [
      'Queen-size bed',
      'Large wardrobe and seating area',
      'Flat-screen TV and minibar',
      'Room service available'
    ]
  },
  {
    id: 'suite',
    title: 'Suite',
    image: '/rooms/suite.jpg',
    description: 'A premium suite with generous living space and luxury finishes.',
    details: [
      'King-size bed with premium linens',
      'Separate living area',
      'Jacuzzi-style bathtub',
      'Complimentary breakfast and lounge access'
    ]
  }
]

export default function RoomBooking({ onBack, initialRoomType }) {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingData, setBookingData] = useState({
    guestName: '',
    roomType: initialRoomType || 'single',
    checkInDate: '',
    checkOutDate: '',
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
    setSelectedRoom(null)
    setBookingData({ guestName: '', roomType: 'single', checkInDate: '', checkOutDate: '', numGuests: 1 })
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
            <div>
              <h3>{selectedRoom.title}</h3>
              <p>{selectedRoom.description}</p>
              <ul className="room-detail-list">
                {selectedRoom.details.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
          <button className="back-btn" type="button" onClick={() => setSelectedRoom(null)}>
            ← Choose another room
          </button>

          <form onSubmit={handleSubmit} className="page-form">
            <div className="form-group">
              <label>Guest Name</label>
              <input
                type="text"
                name="guestName"
                value={bookingData.guestName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Room Type</label>
              <input type="text" value={selectedRoom.title} disabled />
            </div>
            <div className="form-group">
              <label>Check-in Date</label>
              <input
                type="date"
                name="checkInDate"
                value={bookingData.checkInDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Check-out Date</label>
              <input
                type="date"
                name="checkOutDate"
                value={bookingData.checkOutDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Number of Guests</label>
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
            <button type="submit" className="submit-btn">Create Booking</button>
          </form>
        </>
      )}
    </div>
  )
}
