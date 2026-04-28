export default function AdminDashboard({ onNavigate }) {
  const features = [
    { id: 'checkin', title: 'Check In', icon: '/ICONS/check-in.png', color: '#87CEEB' },
    { id: 'roombooking', title: 'Room Booking', icon: '/ICONS/roombooking.png', color: '#87CEEB' },
    { id: 'rooms', title: 'Rooms', icon: '/ICONS/rooms.png', color: '#87CEEB' },
    { id: 'checkout', title: 'Check Out', icon: '/ICONS/check-out.png', color: '#87CEEB' },
    { id: 'cancelbooking', title: 'Cancel Booking', icon: '/ICONS/cancel.png', color: '#87CEEB' },
    { id: 'guests', title: 'Guests', icon: '/ICONS/user.png', color: '#87CEEB' },
  ]

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="features-grid">
        {features.map(feature => (
          <div
            key={feature.id}
            className="feature-card"
            onClick={() => onNavigate(feature.id)}
            style={{ backgroundColor: feature.color }}
          >
            <div className="card-icon">
              <img src={feature.icon} alt={`${feature.title} icon`} />
            </div>
            <h3>{feature.title}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}
