export default function Header() {
  return (
    <header className="admin-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <img src="/ICONS/logo.png" alt="B Morvie logo" />
          </div>
          <h1>B Morvie</h1>
        </div>
        <div className="settings-section">
          <button className="settings-btn">⚙️ Settings</button>
        </div>
      </div>
    </header>
  )
}
