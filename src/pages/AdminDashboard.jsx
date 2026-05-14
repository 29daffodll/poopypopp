const FEATURES = [
  {
    id: 'checkin',
    title: 'Check In',
    description: 'Pick an available room, confirm guest details, and mark the stay started.',
    icon: '/ICONS/check-in.png',
    accent: 'checkin'
  },
  {
    id: 'roombooking',
    title: 'Room Booking',
    description: 'Create reservations with dates, guest ID, and totals in your bookings table.',
    icon: '/ICONS/roombooking.png',
    accent: 'roombooking'
  },
  {
    id: 'rooms',
    title: 'Rooms',
    description: 'Browse branches, room types, and live status from the rooms table.',
    icon: '/ICONS/rooms.png',
    accent: 'rooms'
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping',
    description: 'Shift checklist and priorities; pair with Rooms for live occupancy and status.',
    icon: '/ICONS/rooms.png',
    accent: 'housekeeping'
  },
  {
    id: 'checkout',
    title: 'Check Out',
    description: 'Close active bookings and return rooms to available when permitted.',
    icon: '/ICONS/check-out.png',
    accent: 'checkout'
  },
  {
    id: 'cancelbooking',
    title: 'Cancel Booking',
    description: 'Find a reservation and cancel it with a reason on file.',
    icon: '/ICONS/cancel.png',
    accent: 'cancelbooking'
  },
  {
    id: 'fooddrinks',
    title: 'Food & drinks',
    description: 'Menus and service in one place — food and beverages on separate tabs.',
    icon: '/ICONS/roombooking.png',
    accent: 'fooddrinks'
  },
  {
    id: 'guests',
    title: 'Guests',
    description: 'Guest-role accounts from your users table (no passwords loaded).',
    icon: '/ICONS/user.png',
    accent: 'guests'
  },
  {
    id: 'reviews',
    title: 'Reviews',
    description: 'Guest ratings and comments synced from the reviews table.',
    icon: '/ICONS/user.png',
    accent: 'reviews'
  }
]

export default function AdminDashboard({ onNavigate }) {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <p className="dashboard-eyebrow">Hotelr admin</p>
        <h2>Operations dashboard</h2>
        <p className="dashboard-subtitle">
          Choose a workflow below. Each tile opens a focused tool for front desk and housekeeping.
        </p>
      </header>

      <div className="features-grid">
        {FEATURES.map((feature) => (
          <button
            key={feature.id}
            type="button"
            className={`feature-card feature-card--${feature.accent}`}
            onClick={() => onNavigate(feature.id)}
          >
            <span className="feature-card-glow" aria-hidden="true" />
            <div className="feature-card-top">
              <div className="feature-card-icon-wrap">
                <img src={feature.icon} alt="" width={40} height={40} />
              </div>
              <span className="feature-card-arrow" aria-hidden="true">
                →
              </span>
            </div>
            <h3>{feature.title}</h3>
            <p className="feature-card-desc">{feature.description}</p>
            <span className="feature-card-cta">Open</span>
          </button>
        ))}
      </div>
    </div>
  )
}
