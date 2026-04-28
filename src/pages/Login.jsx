import { useState } from 'react'

export default function Login({ onLogin }) {
  const [loginType, setLoginType] = useState('admin')
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (loginType === 'admin') {
      // Simple admin authentication (in real app, this would be API call)
      if (credentials.email === 'admin@hotel.com' && credentials.password === 'admin123') {
        onLogin('admin', { name: 'Admin User', email: credentials.email })
      } else {
        alert('Invalid admin credentials. Use: admin@hotel.com / admin123')
        return
      }
    } else {
      // Guest login - just need email
      if (credentials.email) {
        onLogin('guest', { email: credentials.email })
      } else {
        alert('Please enter your email address')
        return
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
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

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
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
                onChange={handleChange}
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
  )
}
