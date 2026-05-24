import { useCallback, useEffect, useMemo, useState } from 'react'
import RoomTypeCard from '../components/RoomTypeCard'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { compareSync, hashSync } from 'bcryptjs'

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
  const [authMode, setAuthMode] = useState('login')
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    name: ''
  })
  const [loginError, setLoginError] = useState('')
  const [searchHint, setSearchHint] = useState('')
  const [supabaseLive, setSupabaseLive] = useState(() => isSupabaseConfigured())

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
    setAuthMode('login')
    setCredentials({ email: '', password: '', name: '' })
    setSupabaseLive(isSupabaseConfigured())
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

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError('')

    const email = String(credentials.email ?? '').trim().toLowerCase()
    const password = String(credentials.password ?? '')
    const name = String(credentials.name ?? '').trim()
    if (!email || !password) {
      setLoginError('Enter both email and password.')
      return
    }

    if (authMode === 'signup') {
      if (!supabaseLive) {
        setLoginError('Sign-up requires Supabase configuration.')
        return
      }
      const supabase = getSupabase()
      if (!supabase) {
        setLoginError('Unable to connect to Supabase.')
        return
      }

      if (!name) {
        setLoginError('Enter a name for your guest account.')
        return
      }

      try {
        const hash = hashSync(password, 10)
        const { error } = await supabase.from('users').insert({
          username: name,
          email: email,
          password: hash,
          role: 'guest'
        })

        if (error) {
          if (error.code === '23505' || /duplicate/i.test(error.message)) {
            setLoginError('An account with that email already exists.')
            return
          }
          throw error
        }

        onLogin('guest', {
          name,
          email,
          role: 'guest'
        })
        closeLogin()
      } catch (err) {
        setLoginError(err.message || 'Unable to create account. Try again.')
      }
      return
    }

    if (!supabaseLive) {
      if (email === 'admin@hotel.com' && password === 'admin123') {
        onLogin('admin', {
          name: 'Admin User',
          email,
          role: 'admin'
        })
        closeLogin()
        return
      }

      onLogin('guest', {
        name: email,
        email,
        role: 'guest'
      })
      closeLogin()
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      setLoginError('Unable to connect to Supabase.')
      return
    }

    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email)
        .limit(1)
        .single()

      if (error || !user) {
        setLoginError('Invalid email or password.')
        return
      }

      const hash = String(user.password ?? '')
      if (!hash || !compareSync(password, hash)) {
        setLoginError('Invalid email or password.')
        return
      }

      const role = String(user.role ?? 'guest').toLowerCase()
      const userType = role === 'admin' ? 'admin' : 'guest'
      onLogin(userType, {
        name: String(user.username ?? user.email ?? 'Guest'),
        email: String(user.email ?? email),
        role
      })
      closeLogin()
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check your credentials and try again.')
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

        <section className="room-types-section" aria-label="Room categories">
          <div className="results-header">
            <div>
              <span className="results-eyebrow">Room types</span>
              <h2>B Morvie Hotel</h2>
              <p className="results-sub">Choose a room type to start booking.</p>
            </div>
          </div>

          <div className="room-type-cards">
            {filteredListings.map((hotel) => (
              <RoomTypeCard key={hotel.id} hotel={hotel} onNavigate={onNavigate} />
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
              <p className="login-subtitle">
                {authMode === 'signup'
                  ? 'Create a new guest account'
                  : 'Sign in to staff tools or the guest portal'}
              </p>
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
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {authMode === 'signup' && (
                <div className="form-group">
                  <label htmlFor="home-login-name">Full name</label>
                  <input
                    id="home-login-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={credentials.name}
                    onChange={handleLoginChange}
                    placeholder="Your name"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="home-login-password">Password</label>
                <input
                  id="home-login-password"
                  type="password"
                  name="password"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  value={credentials.password}
                  onChange={handleLoginChange}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button type="submit" className="login-btn">
                {authMode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="login-info login-info--callout">
              <p>
                {authMode === 'signup'
                  ? 'Create a guest account using your email and password.'
                  : 'Sign in with your admin or guest account to access the portal.'}
              </p>
            </div>

            <div className="login-info login-info--link">
              {authMode === 'signup' ? (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setAuthMode('login')
                    setLoginError('')
                  }}
                >
                  Already have an account? Sign in
                </button>
              ) : (
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setAuthMode('signup')
                    setLoginError('')
                  }}
                >
                  New guest? Create an account
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
