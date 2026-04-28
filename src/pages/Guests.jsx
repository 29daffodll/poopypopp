import { useState } from 'react'

export default function Guests({ onBack }) {
  const [guests] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', roomNumber: 101, checkInDate: '2026-04-20' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', roomNumber: 102, checkInDate: '2026-04-22' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', roomNumber: 103, checkInDate: '2026-04-25' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', roomNumber: 104, checkInDate: '2026-04-26' },
  ])

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Guests Management</h2>
      </div>
      <div className="guests-table">
        <table>
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Room Number</th>
              <th>Check-in Date</th>
            </tr>
          </thead>
          <tbody>
            {guests.map(guest => (
              <tr key={guest.id}>
                <td>{guest.name}</td>
                <td>{guest.email}</td>
                <td>{guest.roomNumber}</td>
                <td>{guest.checkInDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
