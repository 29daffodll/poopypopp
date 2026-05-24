import React from 'react'

export default function HotelCard({ hotel, onNavigate }) {
  return (
    <article className="hotel-card" role="article">
      <div className="hotel-card-image">
        <img src={hotel.image} alt={hotel.name} />
        <span className="hotel-card-badge">{hotel.badge}</span>
      </div>

      <div className="hotel-card-content">
        <div className="hotel-card-top">
          <div>
            <h3>{hotel.name}</h3>
            <p className="hotel-card-meta">
              {hotel.rating.toFixed(1)} guest score · {hotel.reviews.toLocaleString()} reviews
            </p>
          </div>
          <div className="hotel-rating" aria-hidden="true">
            <span>{hotel.badge}</span>
            <div>{hotel.rating}</div>
          </div>
        </div>

        <div className="hotel-amenities">
          {hotel.amenities?.slice(0, 4).map((amenity) => (
            <span key={amenity}>{amenity}</span>
          ))}
        </div>

        <p className="hotel-description">{hotel.description}</p>

        <div className="hotel-card-footer">
          <div>
            <span>From per night</span>
            <strong>₱ {hotel.price.toLocaleString()}</strong>
          </div>
          <button
            type="button"
            className="check-availability-btn"
            onClick={() => onNavigate('roombooking', { roomType: hotel.roomType.toLowerCase() })}
          >
            Check availability
          </button>
        </div>
      </div>
    </article>
  )
}
