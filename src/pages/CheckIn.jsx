import { useState } from 'react'

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
    description: 'A spacious room ideal for couples or friends.',
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

export default function CheckIn({ onBack }) {
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [checkInData, setCheckInData] = useState({
    guestName: '',
    roomType: 'single',
    roomNumber: '',
    checkInDate: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setCheckInData(prev => ({ ...prev, [name]: value }))
  }

  const handleRoomSelect = (roomId) => {
    const room = roomOptions.find((option) => option.id === roomId)
    setSelectedRoom(room)
    setCheckInData(prev => ({ ...prev, roomType: roomId }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Check-in confirmed for ${checkInData.guestName} in ${selectedRoom?.title} (Room ${checkInData.roomNumber})`)
    setSelectedRoom(null)
    setCheckInData({ guestName: '', roomType: 'single', roomNumber: '', checkInDate: '' })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Check In</h2>
      </div>

      {!selectedRoom && (
        <>
          <p>Select a room to start the check-in process.</p>
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
                value={checkInData.guestName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Room Type</label>
              <input type="text" value={selectedRoom.title} disabled />
            </div>
            <div className="form-group">
              <label>Room Number</label>
              <input
                type="text"
                name="roomNumber"
                value={checkInData.roomNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Check-in Date</label>
              <input
                type="date"
                name="checkInDate"
                value={checkInData.checkInDate}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="submit-btn">Confirm Check-in</button>
          </form>
        </>
      )}
    </div>
  )
}
