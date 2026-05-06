import { useState } from 'react'

export default function Reviews({ onBack }) {
  // Mock reviews data from submitted feedback
  const [reviews] = useState([
    {
      id: 1,
      bookingId: 'BK001',
      guestName: 'John Smith',
      room: '101 - Suite',
      checkInDate: '2026-04-15',
      checkOutDate: '2026-04-18',
      overallRating: 5,
      cleanlinessRating: 5,
      serviceRating: 4,
      comfortRating: 5,
      amenitiesRating: 5,
      feedback: 'Excellent stay! The suite was spacious and well-maintained. Staff was very helpful.',
      wouldRecommend: 'yes',
      date: '2026-04-18'
    },
    {
      id: 2,
      bookingId: 'BK002',
      guestName: 'Emma Johnson',
      room: '205 - Double',
      checkInDate: '2026-04-10',
      checkOutDate: '2026-04-12',
      overallRating: 4,
      cleanlinessRating: 4,
      serviceRating: 5,
      comfortRating: 4,
      amenitiesRating: 4,
      feedback: 'Very comfortable stay. Good service and clean rooms. Would definitely come back.',
      wouldRecommend: 'yes',
      date: '2026-04-12'
    },
    {
      id: 3,
      bookingId: 'BK003',
      guestName: 'Michael Brown',
      room: '103 - Single',
      checkInDate: '2026-04-05',
      checkOutDate: '2026-04-07',
      overallRating: 5,
      cleanlinessRating: 5,
      serviceRating: 5,
      comfortRating: 5,
      amenitiesRating: 4,
      feedback: 'Perfect for a business trip. Great location, friendly staff, and quality amenities.',
      wouldRecommend: 'yes',
      date: '2026-04-07'
    },
    {
      id: 4,
      bookingId: 'BK004',
      guestName: 'Sarah Davis',
      room: '101 - Suite',
      checkInDate: '2026-03-28',
      checkOutDate: '2026-03-30',
      overallRating: 3,
      cleanlinessRating: 4,
      serviceRating: 3,
      comfortRating: 4,
      amenitiesRating: 3,
      feedback: 'Decent accommodation. Some areas could use improvement but overall satisfactory.',
      wouldRecommend: 'yes',
      date: '2026-03-30'
    }
  ])

  const [filterRoom, setFilterRoom] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  // Calculate average ratings
  const averageRatings = {
    overall: (reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(1),
    cleanliness: (reviews.reduce((sum, r) => sum + r.cleanlinessRating, 0) / reviews.length).toFixed(1),
    service: (reviews.reduce((sum, r) => sum + r.serviceRating, 0) / reviews.length).toFixed(1),
    comfort: (reviews.reduce((sum, r) => sum + r.comfortRating, 0) / reviews.length).toFixed(1),
    amenities: (reviews.reduce((sum, r) => sum + r.amenitiesRating, 0) / reviews.length).toFixed(1)
  }

  // Get unique rooms
  const uniqueRooms = ['all', ...new Set(reviews.map(r => r.room))]

  // Filter and sort reviews
  let filteredReviews = reviews
  if (filterRoom !== 'all') {
    filteredReviews = filteredReviews.filter(r => r.room === filterRoom)
  }

  if (sortBy === 'recent') {
    filteredReviews = filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else if (sortBy === 'rating-high') {
    filteredReviews = filteredReviews.sort((a, b) => b.overallRating - a.overallRating)
  } else if (sortBy === 'rating-low') {
    filteredReviews = filteredReviews.sort((a, b) => a.overallRating - b.overallRating)
  }

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= rating ? 'filled' : 'empty'}`}>
            ★
          </span>
        ))}
        <span className="rating-value">{rating}/5</span>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Guest Reviews</h2>
      </div>

      {/* Average Ratings Summary */}
      <div className="reviews-summary">
        <div className="summary-card">
          <h3>Overall Rating</h3>
          {renderStars(Math.round(averageRatings.overall))}
          <p className="summary-text">{reviews.length} reviews</p>
        </div>
        <div className="summary-card">
          <h3>Cleanliness</h3>
          {renderStars(Math.round(averageRatings.cleanliness))}
          <p className="summary-value">{averageRatings.cleanliness}</p>
        </div>
        <div className="summary-card">
          <h3>Service Quality</h3>
          {renderStars(Math.round(averageRatings.service))}
          <p className="summary-value">{averageRatings.service}</p>
        </div>
        <div className="summary-card">
          <h3>Comfort</h3>
          {renderStars(Math.round(averageRatings.comfort))}
          <p className="summary-value">{averageRatings.comfort}</p>
        </div>
        <div className="summary-card">
          <h3>Amenities</h3>
          {renderStars(Math.round(averageRatings.amenities))}
          <p className="summary-value">{averageRatings.amenities}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="reviews-filters">
        <div className="filter-group">
          <label>Filter by Room:</label>
          <select value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
            {uniqueRooms.map(room => (
              <option key={room} value={room}>
                {room === 'all' ? 'All Rooms' : room}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {filteredReviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div>
                <h3>{review.guestName}</h3>
                <p className="review-room">{review.room}</p>
              </div>
              <div className="review-date">{new Date(review.date).toLocaleDateString()}</div>
            </div>

            <div className="review-overall">
              <span className="review-label">Overall Rating:</span>
              {renderStars(review.overallRating)}
            </div>

            <div className="review-ratings-grid">
              <div className="rating-item">
                <span>Cleanliness</span>
                {renderStars(review.cleanlinessRating)}
              </div>
              <div className="rating-item">
                <span>Service</span>
                {renderStars(review.serviceRating)}
              </div>
              <div className="rating-item">
                <span>Comfort</span>
                {renderStars(review.comfortRating)}
              </div>
              <div className="rating-item">
                <span>Amenities</span>
                {renderStars(review.amenitiesRating)}
              </div>
            </div>

            <p className="review-text">{review.feedback}</p>

            <div className="review-recommend">
              <span className="recommend-badge">
                {review.wouldRecommend === 'yes' ? '✓ Would Recommend' : '✗ Would Not Recommend'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="no-reviews">
          <p>No reviews found for the selected criteria.</p>
        </div>
      )}
    </div>
  )
}
