import { useEffect, useRef, useState } from 'react'

export default function Header({ user, onLogout, onNavigate }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const doNavigate = (page) => {
    setOpen(false)
    if (typeof onNavigate === 'function') onNavigate(page)
  }

  const toggleTheme = () => {
    setOpen(false)
    document.documentElement.classList.toggle('dark-theme')
  }

  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <img src="/ICONS/logo.png" alt="B Morvie logo" />
          </div>
          <h1>B Morvie</h1>
        </div>

        <div className="settings-section" ref={menuRef}>
          <button
            className="settings-btn"
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
          >
            ⚙️ Settings
          </button>

          {open && (
            <div className="settings-menu" role="menu">
              <button type="button" className="settings-menu-item" onClick={() => doNavigate('settings')}>Site settings</button>
              <button type="button" className="settings-menu-item" onClick={() => doNavigate('guests')}>Manage users</button>
              <button type="button" className="settings-menu-item" onClick={() => doNavigate('rooms')}>Manage rooms</button>
              <button type="button" className="settings-menu-item" onClick={() => doNavigate('roombooking')}>Room booking</button>
              <button type="button" className="settings-menu-item" onClick={() => doNavigate('reviews')}>Reviews</button>
              <button type="button" className="settings-menu-item" onClick={toggleTheme}>Toggle theme</button>
              <div className="settings-menu-sep" />
              <button type="button" className="settings-menu-item" onClick={() => { setOpen(false); if (onLogout) onLogout() }}>Sign out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
