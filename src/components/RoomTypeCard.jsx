import React from 'react'

export default function RoomTypeCard({ hotel, onNavigate }) {
  const handleCardClick = () => {
    onNavigate('roombooking', {
      roomType: hotel.roomType.toLowerCase(),
      autoOpenBookingModal: true
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick()
    }
  }

  return (
    <article
      className="room-type-card"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className="room-type-image">
        <img src={hotel.image} alt={hotel.name} />
      </div>
      <div className="room-type-body">
        <div>
          <h4 className="room-type-title">{hotel.name}</h4>
          <p className="room-type-sub">{hotel.description}</p>
        </div>
        <div className="room-type-footer">
          <strong className="room-type-price">₱ {hotel.price.toLocaleString()}</strong>
          <button
            type="button"
            className="check-availability-btn"
            onClick={(e) => {
              e.stopPropagation()
              onNavigate('roombooking', {
                roomType: hotel.roomType.toLowerCase(),
                autoOpenBookingModal: true
              })
            }}
          >
            Book
          </button>
        </div>
      </div>
    </article>
  )
}
