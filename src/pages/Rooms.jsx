import { useState } from 'react'

export default function Rooms({ onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 27)) // April 27, 2026
  const [activeTab, setActiveTab] = useState('calendar')

  const rooms = [
    { id: 'S101', type: 'Single', price: '$100' },
    { id: 'S102', type: 'Single', price: '$100' },
    { id: 'D103', type: 'Double', price: '$150' },
    { id: 'D104', type: 'Double', price: '$150' },
    { id: 'V105', type: 'Suite', price: '$250' },
    { id: 'V106', type: 'Suite', price: '$250' },
  ]

  const reviewsByRoomType = {
    Single: {
      averageRating: 4.5,
      totalReviews: 12,
      reviews: [
        { guestName: 'Michael Brown', rating: 5, text: 'Perfect for business trips. Great location.' },
        { guestName: 'John Smith', rating: 4, text: 'Comfortable and clean. Excellent service.' }
      ]
    },
    Double: {
      averageRating: 4.7,
      totalReviews: 18,
      reviews: [
        { guestName: 'Emma Johnson', rating: 5, text: 'Spacious and very comfortable. Loved it!' },
        { guestName: 'Sarah Davis', rating: 4, text: 'Nice room with great amenities.' }
      ]
    },
    Suite: {
      averageRating: 4.9,
      totalReviews: 15,
      reviews: [
        { guestName: 'John Smith', rating: 5, text: 'Excellent stay! The suite was spacious and well-maintained.' },
        { guestName: 'Robert Wilson', rating: 5, text: 'Luxury suite with amazing views and service.' }
      ]
    }
  }

  const bookings = {
    '2026-04-27': ['S101', 'S102'],
    '2026-04-28': ['D103'],
    '2026-04-29': ['S101'],
    '2026-04-30': ['S102', 'D103'],
    '2026-05-01': ['D104', 'V105'],
    '2026-05-02': ['V106'],
    '2026-05-03': ['S101', 'D103', 'V105'],
  }

  const getDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getStatusForRoom = (roomId, dateStr) => {
    const bookedRooms = bookings[dateStr] || []
    return bookedRooms.includes(roomId) ? 'occupied' : 'available'
  }

  const getCurrentRoomStatus = (roomId) => {
    return getStatusForRoom(roomId, getDateKey(currentDate))
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const dateRange = (() => {
    const visibleDaysBefore = 365
    const visibleDaysAfter = 365
    const startDate = new Date(currentDate)
    startDate.setDate(currentDate.getDate() - visibleDaysBefore)

    return Array.from({ length: visibleDaysBefore + visibleDaysAfter + 1 }, (_, index) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + index)
      return date
    })
  })()

  const overviewDateRange = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() + index)
    return date
  })

  const formatDateLabel = (date) => {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' })
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const yearLabel = currentDate.getFullYear()
  const todayLabel = new Date().toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const roomsByType = rooms.reduce((acc, room) => {
    acc[room.type] = acc[room.type] || []
    acc[room.type].push(room)
    return acc
  }, {})

  const renderStars = (rating) => {
    return (
      <div className="room-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`star ${star <= Math.round(rating) ? 'filled' : 'empty'}`}>
            ★
          </span>
        ))}
      </div>
    )
  }

  const RoomCard = ({ room }) => {
    const currentStatus = getCurrentRoomStatus(room.id)
    const statusLabel = currentStatus === 'occupied' ? 'Occupied' : 'Vacant'
    const statusClass = currentStatus === 'occupied' ? 'occupied' : 'available'
    const roomReviews = reviewsByRoomType[room.type]

    const upcomingBooking = dateRange.find((date) => getStatusForRoom(room.id, getDateKey(date)) === 'occupied')

    return (
      <div className="room-card admin-room-card">
        <div className="room-card-top">
          <div>
            <h3>Room {room.id}</h3>
            <p className="room-card-subtitle">{room.type} • {room.price}/night</p>
          </div>
          <span className={`room-chip ${statusClass}`}>{statusLabel}</span>
        </div>

        <div className="room-card-body">
          <div className="room-card-row">
            <span>Next booking</span>
            <strong>{upcomingBooking ? formatDateLabel(upcomingBooking) : 'No bookings'}</strong>
          </div>
          <div className="room-card-row">
            <span>Guest rating</span>
            <div className="room-rating-summary">
              {renderStars(roomReviews.averageRating)}
              <span>{roomReviews.totalReviews}</span>
            </div>
          </div>

          <div className="room-timeline">
            {overviewDateRange.map((date) => {
              const dayStatus = getStatusForRoom(room.id, getDateKey(date))
              return (
                <div
                  key={getDateKey(date)}
                  className={`timeline-dot ${dayStatus}`}
                  title={`${formatDateLabel(date)} — ${dayStatus === 'occupied' ? 'Booked' : 'Available'}`}
                >
                  <span>{date.getDate()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Rooms Overview</h2>
      </div>

      <div className="rooms-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar View
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="rooms-overview-container">
        <div className="rooms-header-panel">
          <div>
            <p className="section-label">Admin room dashboard</p>
          </div>
          <div className="rooms-controls">
            <button className="month-nav-btn" onClick={previousMonth}>← Prev</button>
            <span className="current-month">{monthName}</span>
            <button className="month-nav-btn" onClick={nextMonth}>Next →</button>
          </div>
        </div>

        <div className="rooms-status-bar">
          <div className="status-pill available"><span></span>Available</div>
          <div className="status-pill occupied"><span></span>Occupied</div>
        </div>

        <div className="room-category-section">
          <div className="room-type-header">
            <h3>All Rooms</h3>
            <span className="room-count">{rooms.length} total rooms</span>
          </div>
          <div className="room-card-grid">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      </div>
      ) : (
      <div className="rooms-calendar-container">
        <div className="calendar-overview-top">
          <div>
            <p className="section-label">Calendar view</p>
            <h3>Room type schedule</h3>
          </div>
          <div className="calendar-header-meta">
            <span className="current-month">{monthName}</span>
            <span className="calendar-year">Year {yearLabel}</span>
            <span className="today-label">Today: {todayLabel}</span>
          </div>
        </div>

        <div className="calendar-view">
          <aside className="calendar-sidebar">
            {Object.entries(roomsByType).map(([type, typeRooms]) => (
              <div key={type} className="sidebar-group">
                <h4>{type}</h4>
                <div className="sidebar-room-list">
                  {typeRooms.map((room) => (
                    <div key={room.id} className="sidebar-room">
                      {room.id}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div className="calendar-main">
            <div className="calendar-header-row">
              {dateRange.map((date) => (
                <div key={getDateKey(date)} className="calendar-header-cell">
                  {formatDateLabel(date)}
                </div>
              ))}
            </div>

            <div className="calendar-room-rows">
              {rooms.map((room) => (
                <div key={room.id} className="calendar-row">
                  {dateRange.map((date) => {
                    const status = getStatusForRoom(room.id, getDateKey(date))
                    return (
                      <div key={getDateKey(date)} className={`calendar-day-cell ${status}`}>
                        {status === 'occupied' ? 'Booked' : ''}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}
