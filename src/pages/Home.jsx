import { useMemo, useState } from 'react'

const hotelListings = [
  {
    id: 'single-room',
    name: 'B Morvie Single Room',
    location: '',
    rating: 8.7,
    reviews: 27387,
    price: 1500,
    image: '/rooms/single.jpg',
    badge: 'Excellent',
    amenities: ['Free Wi-Fi', 'Swimming pool', 'Free parking', 'Spa'],
    description: 'A cozy room perfect for solo travelers or business stays.',
    roomType: 'single'
  },
  {
    id: 'double-room',
    name: 'B Morvie Double Room',
    location: '',
    rating: 7.8,
    reviews: 1081,
    price: 2500,
    image: '/rooms/double.jpg',
    badge: 'Very good',
    amenities: ['Free Wi-Fi', 'Free parking', 'Front desk (24-hour)', 'Breakfast'],
    description: 'A spacious double room ideal for couples or friends.',
    roomType: 'double'
  },
  {
    id: 'suite-room',
    name: 'B Morvie Suite',
    location: '',
    rating: 8.9,
    reviews: 10986,
    price: 5000,
    image: '/rooms/suite.jpg',
    badge: 'Excellent',
    amenities: ['Free Wi-Fi', 'Free parking', 'Front desk (24-hour)', 'Air conditioning'],
    description: 'A premium suite with generous living space and luxury finishes.',
    roomType: 'suite'
  }
]

export default function Home({ onNavigate }) {
  const [search, setSearch] = useState({
    checkIn: '2026-05-01',
    checkOut: '2026-05-03'
  })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginType, setLoginType] = useState('admin')
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  const filteredListings = useMemo(() => {
    return hotelListings
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSearch((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()

    if (loginType === 'admin') {
      // Simple admin authentication (in real app, this would be API call)
      if (credentials.email === 'admin@hotel.com' && credentials.password === 'admin123') {
        onNavigate('dashboard')
        setShowLoginModal(false)
      } else {
        alert('Invalid admin credentials. Use: admin@hotel.com / admin123')
        return
      }
    } else {
      // Guest login - just need email
      if (credentials.email) {
        onNavigate('guestportal')
        setShowLoginModal(false)
      } else {
        alert('Please enter your email address')
        return
      }
    }
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>Find the perfect stay</h1>
          <p>Search rooms, compare prices, and book with flexible check-in options.</p>
          <button className="hero-login-btn" onClick={() => setShowLoginModal(true)}>
            Login
          </button>
        </div>
        <div className="home-search-card">
          <div className="search-field date-field">
            <label>Check-in</label>
            <input type="date" name="checkIn" value={search.checkIn} onChange={handleChange} />
          </div>
          <div className="search-field date-field">
            <label>Check-out</label>
            <input type="date" name="checkOut" value={search.checkOut} onChange={handleChange} />
          </div>
          <button type="button" className="search-btn" onClick={() => {}}>
            SEARCH
          </button>
        </div>
      </section>

      <section className="hotel-results-section">
        <div className="results-header">
          <div>
            <span>Available Rooms</span>
            <h2>B Morvie Hotel</h2>
          </div>
        </div>

        <div className="hotel-listings-grid">
          {filteredListings.map((hotel) => (
            <div key={hotel.id} className="hotel-card">
              <div className="hotel-card-image">
                <img src={hotel.image} alt={hotel.name} />
              </div>
              <div className="hotel-card-content">
                <div className="hotel-card-top">
                  <div>
                    <h3>{hotel.name}</h3>
                  </div>
                  <div className="hotel-rating">
                    <span>{hotel.badge}</span>
                    <div>{hotel.rating}</div>
                  </div>
                </div>
                <div className="hotel-amenities">
                  {hotel.amenities.slice(0, 4).map((amenity) => (
                    <span key={amenity}>{amenity}</span>
                  ))}
                </div>
                <p className="hotel-description">"{hotel.description}"</p>
                <div className="hotel-card-footer">
                  <div>
                    <span>Avg price per night</span>
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
            </div>
          ))}
        </div>
      </section>

      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowLoginModal(false)}>✕</button>
            
            <div className="login-modal-header">
              <div className="logo-section">
                <div className="logo-icon">
                  <img src="/ICONS/logo.png" alt="B Morvie logo" />
                </div>
                <h1>B MORVIE</h1>
              </div>
              <p className="login-subtitle">Hotel Management System</p>
            </div>

            <div className="login-tabs">
              <button
                className={`tab-btn ${loginType === 'admin' ? 'active' : ''}`}
                onClick={() => setLoginType('admin')}
              >
                Admin Login
              </button>
              <button
                className={`tab-btn ${loginType === 'guest' ? 'active' : ''}`}
                onClick={() => setLoginType('guest')}
              >
                Guest Portal
              </button>
            </div>

            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleLoginChange}
                  placeholder={loginType === 'admin' ? 'admin@hotel.com' : 'your.email@example.com'}
                  required
                />
              </div>

              {loginType === 'admin' && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleLoginChange}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}

              <button type="submit" className="login-btn">
                {loginType === 'admin' ? 'Sign In as Admin' : 'Access Guest Portal'}
              </button>
            </form>

            {loginType === 'admin' && (
              <div className="login-info">
                <p><strong>Demo Credentials:</strong></p>
                <p>Email: admin@hotel.com</p>
                <p>Password: admin123</p>
              </div>
            )}

            {loginType === 'guest' && (
              <div className="login-info">
                <p>Enter your booking email to access your reservations and digital keys.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
