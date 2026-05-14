import { useCallback, useEffect, useMemo, useState } from 'react'

function addDaysYmd(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

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

export default function Home({ onNavigate, onLogin }) {
  const [search, setSearch] = useState({
    checkIn: addDaysYmd(1),
    checkOut: addDaysYmd(3)
  })
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginType, setLoginType] = useState('admin')
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [loginError, setLoginError] = useState('')
  const [searchHint, setSearchHint] = useState('')

  const filteredListings = useMemo(() => hotelListings, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSearch((prev) => ({ ...prev, [name]: value }))
    setSearchHint('')
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value
    }))
    setLoginError('')
  }

  const openLogin = useCallback(() => {
    setLoginError('')
    setShowLoginModal(true)
  }, [])

  const closeLogin = useCallback(() => {
    setShowLoginModal(false)
    setLoginError('')
  }, [])

  useEffect(() => {
    if (!showLoginModal) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') closeLogin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLoginModal, closeLogin])

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    setLoginError('')

    if (loginType === 'admin') {
      if (credentials.email === 'admin@hotel.com' && credentials.password === 'admin123') {
        onLogin('admin', {
          name: 'Admin User',
          email: credentials.email,
          rank: 'Administrator'
        })
        closeLogin()
      } else {
        setLoginError('Invalid email or password. Use the demo credentials below.')
      }
    } else if (credentials.email.trim()) {
      onLogin('guest', {
        name: credentials.email.trim(),
        email: credentials.email.trim(),
        rank: 'Guest'
      })
      closeLogin()
    } else {
      setLoginError('Please enter the email address you used when booking.')
    }
  }

  const handleBookClick = () => {
    const inD = new Date(`${search.checkIn}T12:00:00`)
    const outD = new Date(`${search.checkOut}T12:00:00`)
    if (!(inD < outD)) {
      setSearchHint('Check-out must be after check-in.')
      return
    }
    setSearchHint('')
    onNavigate('roombooking', { checkIn: search.checkIn, checkOut: search.checkOut })
  }

  return (
    <div className="home-page">
      <div className="home-page-bg" aria-hidden="true" />

      <header className="home-topbar">
        <div className="home-brand">
          <span className="home-brand-mark" aria-hidden="true" />
          <div>
            <span className="home-brand-name">B Morvie</span>
            <span className="home-brand-tag">Hotel</span>
          </div>
        </div>
        <button type="button" className="home-topbar-login" onClick={openLogin}>
          Sign in
        </button>
      </header>

      <div className="home-page-inner">
        <section className="home-hero">
          <div className="home-hero-main">
            <div className="home-hero-text">
              <p className="home-eyebrow">Stays in the heart of the city</p>
              <h1>Find the perfect stay</h1>
              <p className="home-hero-lead">
                Search dates, compare room types, and book in a few steps. Staff can sign in to the operations
                dashboard; guests use the portal with their booking email.
              </p>
              <ul className="home-hero-perks">
                <li>Flexible check-in dates</li>
                <li>Clear nightly rates</li>
                <li>Single, double, and suite options</li>
              </ul>
              <div className="home-hero-actions">
                <button type="button" className="home-cta-primary" onClick={() => onNavigate('roombooking', {})}>
                  Browse rooms
                </button>
                <button type="button" className="home-cta-secondary" onClick={openLogin}>
                  Staff / guest sign in
                </button>
              </div>
            </div>

            <aside className="home-search-card" aria-label="Search availability">
              <p className="home-search-title">Plan your visit</p>
              <div className="search-field date-field">
                <label htmlFor="home-check-in">Check-in</label>
                <input
                  id="home-check-in"
                  type="date"
                  name="checkIn"
                  value={search.checkIn}
                  onChange={handleChange}
                />
              </div>
              <div className="search-field date-field">
                <label htmlFor="home-check-out">Check-out</label>
                <input
                  id="home-check-out"
                  type="date"
                  name="checkOut"
                  value={search.checkOut}
                  onChange={handleChange}
                />
              </div>
              <button type="button" className="search-btn" onClick={handleBookClick}>
                Search &amp; book
              </button>
              {searchHint ? (
                <p className="home-search-hint home-search-hint--error" role="alert">
                  {searchHint}
                </p>
              ) : (
                <p className="home-search-hint">Opens room booking with your dates prefilled.</p>
              )}
            </aside>
          </div>
        </section>

        <section className="home-features" aria-label="Highlights">
          <div className="home-feature-card">
            <span className="home-feature-icon" aria-hidden="true">
              ◎
            </span>
            <strong>Curated rooms</strong>
            <span>Three categories with photos and amenities at a glance.</span>
          </div>
          <div className="home-feature-card">
            <span className="home-feature-icon" aria-hidden="true">
              ⚡
            </span>
            <strong>Fast booking</strong>
            <span>Jump straight to availability with your travel dates.</span>
          </div>
          <div className="home-feature-card">
            <span className="home-feature-icon" aria-hidden="true">
              ✦
            </span>
            <strong>Guest portal</strong>
            <span>Sign in with email to manage stays and keys after you book.</span>
          </div>
        </section>

        <section className="hotel-results-section">
          <div className="results-header">
            <div>
              <span className="results-eyebrow">Room types</span>
              <h2>B Morvie Hotel</h2>
              <p className="results-sub">Tap a card to open booking with that category selected.</p>
            </div>
          </div>

          <div className="hotel-listings-grid">
            {filteredListings.map((hotel) => (
              <article key={hotel.id} className="hotel-card">
                <div className="hotel-card-image">
                  <img src={hotel.image} alt="" />
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
                    {hotel.amenities.slice(0, 4).map((amenity) => (
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
            ))}
          </div>
        </section>
      </div>

      {showLoginModal && (
        <div
          className="login-modal-overlay"
          role="presentation"
          onClick={closeLogin}
        >
          <div
            className="login-modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-login-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="close-modal" onClick={closeLogin} aria-label="Close sign in">
              ✕
            </button>

            <div className="login-modal-header">
              <div className="logo-section">
                <div className="logo-icon">
                  <img src="/ICONS/logo.png" alt="" />
                </div>
                <h1 id="home-login-title">B Morvie</h1>
              </div>
              <p className="login-subtitle">Sign in to staff tools or the guest portal</p>
            </div>

            <div className="login-tabs" role="tablist" aria-label="Account type">
              <button
                type="button"
                role="tab"
                aria-selected={loginType === 'admin'}
                className={`tab-btn ${loginType === 'admin' ? 'active' : ''}`}
                onClick={() => {
                  setLoginType('admin')
                  setLoginError('')
                }}
              >
                Admin
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={loginType === 'guest'}
                className={`tab-btn ${loginType === 'guest' ? 'active' : ''}`}
                onClick={() => {
                  setLoginType('guest')
                  setLoginError('')
                  setCredentials((c) => ({ ...c, password: '' }))
                }}
              >
                Guest
              </button>
            </div>

            {loginError && (
              <div className="home-login-error" role="alert">
                {loginError}
              </div>
            )}

            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="home-login-email">Email</label>
                <input
                  id="home-login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={credentials.email}
                  onChange={handleLoginChange}
                  placeholder={loginType === 'admin' ? 'admin@hotel.com' : 'your.email@example.com'}
                  required
                />
              </div>

              {loginType === 'admin' && (
                <div className="form-group">
                  <label htmlFor="home-login-password">Password</label>
                  <input
                    id="home-login-password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={handleLoginChange}
                    placeholder="Enter password"
                    required
                  />
                </div>
              )}

              <button type="submit" className="login-btn">
                {loginType === 'admin' ? 'Sign in as admin' : 'Open guest portal'}
              </button>
            </form>

            {loginType === 'admin' && (
              <div className="login-info login-info--callout">
                <p>
                  <strong>Demo</strong>
                </p>
                <p>
                  <code>admin@hotel.com</code> · <code>admin123</code>
                </p>
              </div>
            )}

            {loginType === 'guest' && (
              <div className="login-info">
                <p>Use the same email you would use for a reservation; this build does not verify against the database.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
