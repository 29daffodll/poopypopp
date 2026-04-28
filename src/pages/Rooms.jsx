import { useState } from 'react'

export default function Rooms({ onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 27)) // April 27, 2026
  const [expandedRooms, setExpandedRooms] = useState({})
  
  const rooms = [
    { id: 101, type: 'Single', price: '$100' },
    { id: 102, type: 'Double', price: '$150' },
    { id: 103, type: 'Suite', price: '$250' },
    { id: 104, type: 'Single', price: '$100' },
    { id: 105, type: 'Double', price: '$150' },
    { id: 106, type: 'Suite', price: '$250' },
  ]

  const bookings = {
    '2026-04-27': [101, 102],
    '2026-04-28': [103],
    '2026-04-29': [101],
    '2026-04-30': [102, 103],
    '2026-05-01': [104, 105],
    '2026-05-02': [106],
    '2026-05-03': [101, 103, 105],
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getStatusForRoom = (roomId, dateStr) => {
    const bookedRooms = bookings[dateStr] || []
    if (bookedRooms.includes(roomId)) return 'occupied'
    return 'available'
  }

  const getCurrentRoomStatus = (roomId) => {
    const todayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    return getStatusForRoom(roomId, todayStr)
  }

  const toggleRoom = (roomId) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }))
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const RoomCalendar = ({ room }) => {
    const isExpanded = expandedRooms[room.id]
    const currentStatus = getCurrentRoomStatus(room.id)
    const statusLabel = currentStatus === 'occupied' ? 'OCCUPIED' : 'VACANT'
    const statusClass = currentStatus === 'occupied' ? 'status-occupied' : 'status-vacant'
    const isSuite = room.type === 'Suite'

    return (
      <div className={`room-calendar-card ${isSuite ? 'suite-room' : ''}`}>
        <div className="room-calendar-header">
          <div className="header-left">
            <span className="room-number-title">Room {room.id}</span>
            <span className="room-type-title">{room.type}</span>
          </div>
          <div className="header-center">
            <span className={`room-status-badge ${statusClass}`}>{statusLabel}</span>
          </div>
          <div className="header-right">
            <span className="room-price-title">{room.price}/night</span>
            <button 
              className="toggle-btn"
              onClick={() => toggleRoom(room.id)}
              title={isExpanded ? "Hide calendar" : "Show calendar"}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="room-calendar-grid">
            <div className="room-weekdays">
              <div className="room-weekday">Sun</div>
              <div className="room-weekday">Mon</div>
              <div className="room-weekday">Tue</div>
              <div className="room-weekday">Wed</div>
              <div className="room-weekday">Thu</div>
              <div className="room-weekday">Fri</div>
              <div className="room-weekday">Sat</div>
            </div>

            <div className="room-dates-grid">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="room-empty-date"></div>
                }
                
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const status = getStatusForRoom(room.id, dateStr)
                
                return (
                  <div
                    key={`date-${day}`}
                    className={`room-calendar-date ${status}`}
                  >
                    <div className="room-date-day">{day}</div>
                    <div className={`room-status-indicator ${status}`}></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Rooms Management - Calendar View</h2>
      </div>

      <div className="rooms-calendar-container">
        <div className="calendar-nav">
          <button onClick={previousMonth} className="month-nav-btn">← Prev</button>
          <h3>{monthName}</h3>
          <button onClick={nextMonth} className="month-nav-btn">Next →</button>
        </div>

        <div className="room-legend">
          <div className="legend-item">
            <div className="legend-dot available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot occupied"></div>
            <span>Occupied</span>
          </div>
        </div>

        <div className="room-types-container">
          {['Single', 'Double', 'Suite'].map(roomType => {
            const roomsOfType = rooms.filter(r => r.type === roomType)
            return (
              <div key={roomType} className="room-type-section">
                <div className="room-type-header">
                  <h3>{roomType} Rooms</h3>
                  <span className="room-count">({roomsOfType.length} rooms)</span>
                </div>
                <div className="rooms-calendars-grid">
                  {roomsOfType.map(room => (
                    <RoomCalendar key={room.id} room={room} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
