import { useState } from 'react'

export default function DigitalKeys({ onBack }) {
  const [selectedKey, setSelectedKey] = useState(null)
  const [showQRCode, setShowQRCode] = useState(false)

  const digitalKeys = [
    {
      id: 'KEY001',
      bookingId: 'BK001',
      roomNumber: 101,
      roomType: 'Suite',
      accessCode: '7382945',
      checkIn: '2026-04-27',
      checkOut: '2026-04-30',
      status: 'Active',
      keyType: 'Mobile Key',
      activatedAt: '2026-04-27T10:30:00'
    },
    {
      id: 'KEY002',
      bookingId: 'BK002',
      roomNumber: 205,
      roomType: 'Double',
      accessCode: '5629183',
      checkIn: '2026-05-05',
      checkOut: '2026-05-08',
      status: 'Pending',
      keyType: 'Mobile Key',
      activatedAt: null
    }
  ]

  const handleViewKey = (key) => {
    setSelectedKey(key)
    setShowQRCode(false)
  }

  const handleActivateKey = () => {
    if (selectedKey && selectedKey.status === 'Pending') {
      const updatedKey = { ...selectedKey, status: 'Active', activatedAt: new Date().toISOString() }
      setSelectedKey(updatedKey)
    }
  }

  const generateQRCode = () => {
    setShowQRCode(!showQRCode)
  }

  const getTimeRemaining = (checkOut) => {
    const checkOutDate = new Date(checkOut)
    const now = new Date()
    const diff = checkOutDate - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Digital Keys</h2>
      </div>
      <p className="form-subtitle">Contactless check-in with your mobile device</p>

      <div className="keys-container">
        <div className="keys-list">
          <h3>Your Digital Keys</h3>
          {digitalKeys.length === 0 ? (
            <p className="no-keys">No digital keys available</p>
          ) : (
            <div className="keys-grid">
              {digitalKeys.map(key => (
                <div
                  key={key.id}
                  className={`key-card ${key.status.toLowerCase()} ${selectedKey?.id === key.id ? 'selected' : ''}`}
                  onClick={() => handleViewKey(key)}
                >
                  <div className="key-header">
                    <span className="key-badge">🔑</span>
                    <span className={`key-status ${key.status.toLowerCase()}`}>
                      {key.status}
                    </span>
                  </div>
                  <div className="key-info">
                    <p className="room-display">Room {key.roomNumber}</p>
                    <p className="room-type">{key.roomType}</p>
                    <p className="dates">
                      {new Date(key.checkIn).toLocaleDateString()} - {new Date(key.checkOut).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedKey && (
          <div className="key-detail-panel">
            <h3>Key Details</h3>

            <div className="detail-row">
              <label>Booking ID</label>
              <p>{selectedKey.bookingId}</p>
            </div>

            <div className="detail-row">
              <label>Room</label>
              <p>Room {selectedKey.roomNumber} ({selectedKey.roomType})</p>
            </div>

            <div className="detail-row">
              <label>Access Code</label>
              <p className="access-code">{selectedKey.accessCode}</p>
            </div>

            <div className="detail-row">
              <label>Check In</label>
              <p>{new Date(selectedKey.checkIn).toLocaleDateString()}</p>
            </div>

            <div className="detail-row">
              <label>Check Out</label>
              <p>{new Date(selectedKey.checkOut).toLocaleDateString()}</p>
            </div>

            <div className="detail-row">
              <label>Key Type</label>
              <p>{selectedKey.keyType}</p>
            </div>

            {selectedKey.status === 'Active' && (
              <div className="detail-row">
                <label>Access Valid For</label>
                <p>{getTimeRemaining(selectedKey.checkOut)}</p>
              </div>
            )}

            <div className="key-actions">
              {selectedKey.status === 'Pending' && (
                <button className="action-btn activate-btn" onClick={handleActivateKey}>
                  ✓ Activate Key Now
                </button>
              )}

              {selectedKey.status === 'Active' && (
                <>
                  <button className="action-btn qr-btn" onClick={generateQRCode}>
                    📱 {showQRCode ? 'Hide' : 'Show'} QR Code
                  </button>

                  {showQRCode && (
                    <div className="qr-code-container">
                      <div className="qr-placeholder">
                        <p>📲</p>
                        <p>Scan with hotel app</p>
                      </div>
                      <p className="qr-info">or use access code: {selectedKey.accessCode}</p>
                    </div>
                  )}
                </>
              )}

              <button className="action-btn secondary" onClick={() => setSelectedKey(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
