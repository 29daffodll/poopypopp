import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

function titleCaseRoomType(raw) {
  if (raw == null || raw === '') return 'Single'
  const s = String(raw).trim()
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function normalizeDbRoom(row) {
  const rid = pick(row, 'roomid', 'room_id')
  const num = pick(row, 'roomnumber', 'room_number')
  const type = titleCaseRoomType(pick(row, 'roomtype', 'room_type'))
  const ppn = pick(row, 'pricepernight', 'price_per_night')
  const st = String(pick(row, 'status') || 'available').toLowerCase()
  const price = ppn != null && Number.isFinite(Number(ppn)) ? `$${Number(ppn).toFixed(0)}` : '—'
  return {
    id: String(num ?? rid ?? ''),
    dbRoomId: rid,
    branchid: pick(row, 'branchid', 'branch_id'),
    type,
    price,
    capacity: pick(row, 'capacity'),
    dbStatus: st,
    fromDb: true
  }
}

const MOCK_ROOMS = [
  { id: 'S101', type: 'Single', price: '$100', fromDb: false },
  { id: 'S102', type: 'Single', price: '$100', fromDb: false },
  { id: 'D103', type: 'Double', price: '$150', fromDb: false },
  { id: 'D104', type: 'Double', price: '$150', fromDb: false },
  { id: 'V105', type: 'Suite', price: '$250', fromDb: false },
  { id: 'V106', type: 'Suite', price: '$250', fromDb: false }
]

const reviewsByRoomType = {
  Single: {
    averageRating: 4.5,
    totalReviews: 12,
    reviews: [
      { guestName: 'Michael Brown', rating: 5, text: 'Perfect for business trips. Great location.' },
      { guestName: 'John Smith', rating: 4, text: 'Comfortable and clean. Excellent service.' }
    ]
  },
  Double: {
    averageRating: 4.7,
    totalReviews: 18,
    reviews: [
      { guestName: 'Emma Johnson', rating: 5, text: 'Spacious and very comfortable. Loved it!' },
      { guestName: 'Sarah Davis', rating: 4, text: 'Nice room with great amenities.' }
    ]
  },
  Suite: {
    averageRating: 4.9,
    totalReviews: 15,
    reviews: [
      { guestName: 'John Smith', rating: 5, text: 'Excellent stay! The suite was spacious and well-maintained.' },
      { guestName: 'Robert Wilson', rating: 5, text: 'Luxury suite with amazing views and service.' }
    ]
  }
}

const bookings = {
  '2026-04-27': ['S101', 'S102'],
  '2026-04-28': ['D103'],
  '2026-04-29': ['S101'],
  '2026-04-30': ['S102', 'D103'],
  '2026-05-01': ['D104', 'V105'],
  '2026-05-02': ['V106'],
  '2026-05-03': ['S101', 'D103', 'V105']
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function isTodayDate(date) {
  return getDateKey(date) === getDateKey(new Date())
}

function chipStateFromDb(dbStatus) {
  if (dbStatus === 'occupied') return { label: 'Occupied', cls: 'occupied' }
  if (dbStatus === 'maintenance') return { label: 'Maintenance', cls: 'maintenance' }
  return { label: 'Vacant', cls: 'available' }
}

function RoomCard({
  room,
  currentDate,
  getStatusForRoom,
  formatDateLabel,
  overviewDateRange,
  dateRange
}) {
  const roomReviews = reviewsByRoomType[room.type] || reviewsByRoomType.Single

  const currentStatus = room.fromDb
    ? room.dbStatus === 'occupied'
      ? 'occupied'
      : room.dbStatus === 'maintenance'
        ? 'maintenance'
        : 'available'
    : getStatusForRoom(room.id, getDateKey(currentDate))

  const chip = room.fromDb
    ? chipStateFromDb(room.dbStatus)
    : {
        label: currentStatus === 'occupied' ? 'Occupied' : 'Vacant',
        cls: currentStatus === 'occupied' ? 'occupied' : 'available'
      }

  const upcomingBooking = room.fromDb
    ? null
    : dateRange.find((date) => getStatusForRoom(room.id, getDateKey(date)) === 'occupied')

  const dayStatusFor = (date) => {
    if (room.fromDb) {
      if (room.dbStatus === 'occupied') return 'occupied'
      if (room.dbStatus === 'maintenance') return 'maintenance'
      return 'available'
    }
    return getStatusForRoom(room.id, getDateKey(date))
  }

  return (
    <div className="room-card admin-room-card">
      <div className="room-card-top">
        <div>
          <h3>Room {room.id}</h3>
          <p className="room-card-subtitle">
            {room.type} • {room.price}/night
            {room.fromDb && room.branchid != null && (
              <span className="rooms-db-meta"> · Branch {String(room.branchid)}</span>
            )}
            {room.fromDb && room.capacity != null && (
              <span className="rooms-db-meta"> · Cap. {String(room.capacity)}</span>
            )}
          </p>
        </div>
        <span className={`room-chip ${chip.cls}`}>{chip.label}</span>
      </div>

      <div className="room-card-body">
        <div className="room-card-row">
          <span>Next booking</span>
          <strong>
            {room.fromDb ? '—' : upcomingBooking ? formatDateLabel(upcomingBooking) : 'No bookings'}
          </strong>
        </div>
        <div className="room-card-row">
          <span>Guest rating</span>
          <div className="room-rating-summary">
            <div className="room-review-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`star ${star <= Math.round(roomReviews.averageRating) ? 'filled' : 'empty'}`}>
                  ★
                </span>
              ))}
            </div>
            <span>{roomReviews.totalReviews}</span>
          </div>
        </div>

        <div className="room-timeline">
          {overviewDateRange.map((date) => {
            const dayStatus = dayStatusFor(date)
            const title = room.fromDb
              ? `${formatDateLabel(date)} — status from database (${room.dbStatus})`
              : `${formatDateLabel(date)} — ${dayStatus === 'occupied' ? 'Booked' : 'Available'}`
            return (
              <div
                key={getDateKey(date)}
                className={`timeline-dot ${dayStatus}`}
                title={title}
              >
                <span>{date.getDate()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Rooms({ onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 27))
  const [activeTab, setActiveTab] = useState('calendar')
  const [remoteRows, setRemoteRows] = useState(null)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState('')

  const supabaseLive = isSupabaseConfigured()

  const loadRooms = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setRemoteRows(null)
      return
    }
    setRoomsLoading(true)
    setRoomsError('')
    const { data, error } = await supabase.from('rooms').select('*').limit(200)
    setRoomsLoading(false)
    if (error) {
      setRoomsError(error.message)
      setRemoteRows([])
      return
    }
    const rows = data ?? []
    rows.sort((a, b) => {
      const idA = Number(pick(a, 'roomid', 'room_id')) || 0
      const idB = Number(pick(b, 'roomid', 'room_id')) || 0
      return idA - idB
    })
    setRemoteRows(rows)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadRooms()
    })
  }, [loadRooms])

  const rooms = useMemo(() => {
    if (!supabaseLive) return MOCK_ROOMS
    if (remoteRows === null) return []
    return remoteRows.map(normalizeDbRoom)
  }, [supabaseLive, remoteRows])

  const getStatusForRoom = (roomId, dateStr) => {
    const bookedRooms = bookings[dateStr] || []
    return bookedRooms.includes(roomId) ? 'occupied' : 'available'
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const dateRange = useMemo(() => {
    const visibleDaysBefore = 365
    const visibleDaysAfter = 365
    const startDate = new Date(currentDate)
    startDate.setDate(currentDate.getDate() - visibleDaysBefore)

    return Array.from({ length: visibleDaysBefore + visibleDaysAfter + 1 }, (_, index) => {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + index)
      return date
    })
  }, [currentDate])

  const overviewDateRange = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(currentDate)
        date.setDate(currentDate.getDate() + index)
        return date
      }),
    [currentDate]
  )

  const formatDateLabel = (date) => {
    return date.toLocaleString('default', { month: 'short', day: 'numeric' })
  }

  const calendarMonthDays = useMemo(() => {
    const y = currentDate.getFullYear()
    const m = currentDate.getMonth()
    const lastDay = new Date(y, m + 1, 0).getDate()
    return Array.from({ length: lastDay }, (_, i) => new Date(y, m, i + 1))
  }, [currentDate])

  const calendarColCount = calendarMonthDays.length

  const getCalendarCellStatus = (room, date) => {
    if (room.fromDb) {
      const s = String(room.dbStatus || 'available').toLowerCase()
      if (s === 'occupied') return 'occupied'
      if (s === 'maintenance') return 'maintenance'
      if (s === 'available') return 'available'
      return 'neutral'
    }
    return getStatusForRoom(room.id, getDateKey(date))
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const todayLabel = new Date().toLocaleDateString('default', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const anyLiveRooms = supabaseLive && rooms.some((r) => r.fromDb)

  return (
    <div className="page-content">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>← Back</button>
        <h2>Rooms Overview</h2>
      </div>

      {supabaseLive && (
        <div className="rooms-supabase-strip">
          {(roomsLoading || remoteRows === null) && (
            <span className="rooms-supabase-muted">Loading rooms from Supabase…</span>
          )}
          {!roomsLoading && roomsError && (
            <span className="rooms-supabase-error">{roomsError}</span>
          )}
          {!roomsLoading && !roomsError && remoteRows !== null && (
            <span className="rooms-supabase-muted">
              Showing <strong>{rooms.length}</strong> row{rooms.length === 1 ? '' : 's'} from the <code>rooms</code> table.
            </span>
          )}
          <button type="button" className="rooms-supabase-refresh" onClick={() => void loadRooms()}>
            Refresh rooms
          </button>
        </div>
      )}

      <div className="rooms-tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar View
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="rooms-overview-container">
          <div className="rooms-header-panel">
            <div>
              <p className="section-label">Admin room dashboard</p>
            </div>
            <div className="rooms-controls">
              <button type="button" className="month-nav-btn" onClick={previousMonth}>← Prev</button>
              <span className="current-month">{monthName}</span>
              <button type="button" className="month-nav-btn" onClick={nextMonth}>Next →</button>
            </div>
          </div>

          <div className="rooms-status-bar">
            <div className="status-pill available"><span />Available</div>
            <div className="status-pill occupied"><span />Occupied</div>
            <div className="status-pill maintenance"><span />Maintenance</div>
          </div>

          <div className="room-category-section">
            <div className="room-type-header">
              <h3>All Rooms</h3>
              <span className="room-count">{rooms.length} total rooms</span>
            </div>
            {!roomsLoading && rooms.length === 0 && supabaseLive && (
              <p className="rooms-empty-msg">No rows returned from <code>rooms</code> (empty table or RLS blocking read).</p>
            )}
            <div className="room-card-grid">
              {rooms.map((room) => (
                <RoomCard
                  key={room.fromDb ? `db-${room.dbRoomId}` : room.id}
                  room={room}
                  currentDate={currentDate}
                  getStatusForRoom={getStatusForRoom}
                  formatDateLabel={formatDateLabel}
                  overviewDateRange={overviewDateRange}
                  dateRange={dateRange}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rooms-calendar-container">
          <div className="calendar-overview-top">
            <div>
              <p className="section-label">Calendar view</p>
              <h3>Monthly occupancy</h3>
              <p className="rooms-cal-subtitle">
                Each column is one day in <strong>{monthName}</strong>; each row is one room. Headers and cells share
                the same grid so columns line up. Cell color is{' '}
                {anyLiveRooms
                  ? 'the current status from Supabase for that room (shown on every day until per-day bookings are wired in).'
                  : 'from the demo booking map for that room and date.'}
              </p>
            </div>
            <div className="calendar-header-meta">
              <div className="rooms-cal-nav">
                <button type="button" className="month-nav-btn" onClick={previousMonth} aria-label="Previous month">
                  ← Prev
                </button>
                <span className="current-month">{monthName}</span>
                <button type="button" className="month-nav-btn" onClick={nextMonth} aria-label="Next month">
                  Next →
                </button>
              </div>
              <span className="today-label">Today: {todayLabel}</span>
            </div>
          </div>

          <div className="rooms-cal-legend" aria-hidden="true">
            <span className="rooms-cal-legend-item">
              <span className="rooms-cal-legend-swatch available" /> Free
            </span>
            <span className="rooms-cal-legend-item">
              <span className="rooms-cal-legend-swatch occupied" /> Booked
            </span>
            <span className="rooms-cal-legend-item">
              <span className="rooms-cal-legend-swatch maintenance" /> Maintenance
            </span>
            <span className="rooms-cal-legend-item">
              <span className="rooms-cal-legend-swatch neutral" /> N/A
            </span>
          </div>

          <div
            className="rooms-cal-matrix"
            style={{ '--rooms-cal-cols': calendarColCount }}
          >
            <div className="rooms-cal-row rooms-cal-row--head">
              <div className="rooms-cal-gutter rooms-cal-gutter--corner">Room</div>
              {calendarMonthDays.map((date) => (
                <div
                  key={getDateKey(date)}
                  className={`rooms-cal-head-cell ${isTodayDate(date) ? 'is-today' : ''}`}
                  title={date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                >
                  <span className="rooms-cal-dow">
                    {date.toLocaleDateString('default', { weekday: 'short' })}
                  </span>
                  <span className="rooms-cal-dom">{date.getDate()}</span>
                </div>
              ))}
            </div>

            {rooms.map((room) => (
              <div
                key={room.fromDb ? `db-${String(room.dbRoomId)}-b${String(room.branchid ?? '')}` : `mock-${room.id}`}
                className="rooms-cal-row rooms-cal-row--body"
              >
                <div className="rooms-cal-gutter rooms-cal-gutter--room">
                  <span className="rooms-cal-room-id">{room.id}</span>
                  <span className="rooms-cal-room-type">{room.type}</span>
                </div>
                {calendarMonthDays.map((date) => {
                  const status = getCalendarCellStatus(room, date)
                  const title = `${room.id} · ${date.toLocaleDateString('default', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })} · ${
                    status === 'occupied'
                      ? 'Booked'
                      : status === 'maintenance'
                        ? 'Maintenance'
                        : status === 'neutral'
                          ? 'Unknown status'
                          : 'Available'
                  }`
                  const mark =
                    status === 'occupied' ? '●' : status === 'maintenance' ? '⚙' : status === 'neutral' ? '?' : '·'
                  return (
                    <div
                      key={getDateKey(date)}
                      className={`rooms-cal-cell ${status} ${isTodayDate(date) ? 'is-today' : ''}`}
                      title={title}
                    >
                      <span className="rooms-cal-cell-mark">{mark}</span>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
