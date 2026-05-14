import { useState } from 'react'

function RatingStars({ value, onChange, name }) {
  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star ${star <= value ? 'active' : ''}`}
          onClick={() => onChange(name, star)}
          title={`${star} star${star > 1 ? 's' : ''}`}
        >
          ⭐
        </button>
      ))}
      <span className="rating-text">{value}/5</span>
    </div>
  )
}

export default function Feedback({ onBack }) {
  const [formData, setFormData] = useState({
    bookingId: '',
    overallRating: 5,
    cleanlinessRating: 5,
    serviceRating: 5,
    comfortRating: 5,
    amenitiesRating: 5,
    feedback: '',
    wouldRecommend: 'yes'
  })

  const [submitted, setSubmitted] = useState(false)

  const mockBookings = [
    { id: 'BK001', room: '101 - Suite' },
    { id: 'BK002', room: '205 - Double' },
    { id: 'BK003', room: '103 - Single' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({
        bookingId: '',
        overallRating: 5,
        cleanlinessRating: 5,
        serviceRating: 5,
        comfortRating: 5,
        amenitiesRating: 5,
        feedback: '',
        wouldRecommend: 'yes'
      })
      setSubmitted(false)
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="page-content">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Thank You for Your Feedback!</h2>
          <p>Your review helps us improve our service. We appreciate you taking the time to share your experience.</p>
          <button className="back-btn" onClick={onBack}>← Back to Portal</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Post-Checkout Feedback</h2>
      </div>
      <p className="form-subtitle">Share your experience and help us improve</p>

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Your Booking *</label>
          <select
            name="bookingId"
            value={formData.bookingId}
            onChange={handleChange}
            required
          >
            <option value="">-- Choose a booking --</option>
            {mockBookings.map(booking => (
              <option key={booking.id} value={booking.id}>
                {booking.id} - {booking.room}
              </option>
            ))}
          </select>
        </div>

        <div className="rating-section">
          <h3>Rate Your Experience</h3>

          <div className="rating-group">
            <label>Overall Experience</label>
            <RatingStars
              value={formData.overallRating}
              onChange={handleRatingChange}
              name="overallRating"
            />
          </div>

          <div className="rating-group">
            <label>Cleanliness</label>
            <RatingStars
              value={formData.cleanlinessRating}
              onChange={handleRatingChange}
              name="cleanlinessRating"
            />
          </div>

          <div className="rating-group">
            <label>Service Quality</label>
            <RatingStars
              value={formData.serviceRating}
              onChange={handleRatingChange}
              name="serviceRating"
            />
          </div>

          <div className="rating-group">
            <label>Room Comfort</label>
            <RatingStars
              value={formData.comfortRating}
              onChange={handleRatingChange}
              name="comfortRating"
            />
          </div>

          <div className="rating-group">
            <label>Amenities</label>
            <RatingStars
              value={formData.amenitiesRating}
              onChange={handleRatingChange}
              name="amenitiesRating"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Additional Comments</label>
          <textarea
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            placeholder="Tell us what you loved or what we can improve..."
            rows="6"
          ></textarea>
        </div>

        <div className="form-group radio-group">
          <label>Would you recommend us to others?</label>
          <div className="radio-options">
            <label className="radio-label">
              <input
                type="radio"
                name="wouldRecommend"
                value="yes"
                checked={formData.wouldRecommend === 'yes'}
                onChange={handleChange}
              />
              Yes, definitely!
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="wouldRecommend"
                value="maybe"
                checked={formData.wouldRecommend === 'maybe'}
                onChange={handleChange}
              />
              Maybe
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="wouldRecommend"
                value="no"
                checked={formData.wouldRecommend === 'no'}
                onChange={handleChange}
              />
              Not really
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn">Submit Feedback</button>
      </form>
    </div>
  )
}
