import { useState } from 'react'

export default function Sidebar({ user, onLogout }) {
  const [availableRooms] = useState(99)
  const [reservedRooms] = useState(1)

  return (
    <aside className="sidebar">
      <div className="user-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Rank:</strong> {user.rank}</p>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="pie-chart available">
            <div className="pie-text">{availableRooms}%</div>
          </div>
          <p>Available Rooms</p>
        </div>

        <div className="stat-card">
          <div className="pie-chart reserved">
            <div className="pie-text">{reservedRooms}%</div>
          </div>
          <p>Reserved Rooms</p>
        </div>
      </div>

      <button className="logout-btn" onClick={onLogout}>
        <span className="power-icon">⏻</span> Log Out
      </button>
    </aside>
  )
}
