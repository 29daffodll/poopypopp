import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase, getSupabaseEnvFlags, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

function readDefaultGuestId() {
  const raw = import.meta.env.VITE_DEFAULT_GUEST_ID || import.meta.env.NEXT_PUBLIC_DEFAULT_GUEST_ID
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

function todayYmd() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDaysYmd(ymd, days) {
  const [y, m, da] = ymd.split('-').map(Number)
  const d = new Date(y, m - 1, da)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isAvailableStatus(s) {
  return String(s ?? '').toLowerCase() === 'available'
}

const TYPE_IMAGE = {
  single: '/rooms/single.jpg',
  double: '/rooms/double.jpg',
  suite: '/rooms/suite.jpg'
}

function typeImage(roomType) {
  const t = String(roomType ?? '').toLowerCase()
  return TYPE_IMAGE[t] || '/rooms/single.jpg'
}

function normalizeRoomRow(row, index) {
  const id = pick(row, 'roomid', 'room_id')
  return {
    key: id != null ? String(id) : `idx-${index}`,
    id,
    branchId: pick(row, 'branchid', 'branch_id'),
    roomNumber: String(pick(row, 'roomnumber', 'room_number') ?? '—'),
    roomType: String(pick(row, 'roomtype', 'room_type') ?? '—'),
    pricePerNight: Number(pick(row, 'pricepernight', 'price_per_night')) || 0,
    status: String(pick(row, 'status') ?? ''),
    capacity: Number(pick(row, 'capacity')) || 0,
    fromDb: true
  }
}

const MOCK_AVAILABLE = [
  normalizeRoomRow(
    {
      roomid: 51,
      branchid: 1,
      roomnumber: '101',
      roomtype: 'single',
      pricepernight: 120,
      status: 'available',
      capacity: 1
    },
    0
  ),
  normalizeRoomRow(
    {
      roomid: 52,
      branchid: 1,
      roomnumber: '102',
      roomtype: 'double',
      pricepernight: 180,
      status: 'available',
      capacity: 2
    },
    1
  ),
  normalizeRoomRow(
    {
      roomid: 59,
      branchid: 3,
      roomnumber: '304',
      roomtype: 'suite',
      pricepernight: 350,
      status: 'available',
      capacity: 4
    },
    2
  )
].map((r) => ({ ...r, fromDb: false }))

export default function CheckIn({ onBack }) {
  const [rawRooms, setRawRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [guestName, setGuestName] = useState('')
  const [guestId, setGuestId] = useState(() => (readDefaultGuestId() != null ? String(readDefaultGuestId()) : ''))
  const [checkInDate, setCheckInDate] = useState(todayYmd)
  const [checkOutDate, setCheckOutDate] = useState(() => addDaysYmd(todayYmd(), 1))
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [banner, setBanner] = useState('')

  const supabaseLive = isSupabaseConfigured()
  const envFlags = getSupabaseEnvFlags()

  const loadRooms = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setRawRooms([])
      return
    }
    setLoading(true)
    setLoadError('')
    try {
      const { data, error } = await supabase.from('rooms').select('*').limit(500)
      if (error) throw error
      setRawRooms(data ?? [])
    } catch (e) {
      setLoadError(e.message || String(e))
      setRawRooms([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadRooms()
    })
  }, [loadRooms])

  const normalizedDb = useMemo(() => {
    if (!supabaseLive) return MOCK_AVAILABLE
    return (rawRooms ?? []).map((row, i) => normalizeRoomRow(row, i))
  }, [supabaseLive, rawRooms])

  const availableRooms = useMemo(
    () => normalizedDb.filter((r) => isAvailableStatus(r.status)),
    [normalizedDb]
  )

  const branchOptions = useMemo(() => {
    const set = new Set()
    for (const r of availableRooms) {
      if (r.branchId != null) set.add(Number(r.branchId))
    }
    return [...set].sort((a, b) => a - b)
  }, [availableRooms])

  const typeOptions = useMemo(() => {
    const set = new Set()
    for (const r of availableRooms) {
      if (r.roomType && r.roomType !== '—') set.add(String(r.roomType).toLowerCase())
    }
    return [...set].sort()
  }, [availableRooms])

  const filteredRooms = useMemo(() => {
    let list = [...availableRooms]
    if (branchFilter !== 'all') {
      const b = Number(branchFilter)
      list = list.filter((r) => Number(r.branchId) === b)
    }
    if (typeFilter !== 'all') {
      list = list.filter((r) => String(r.roomType).toLowerCase() === typeFilter)
    }
    list.sort((a, b) => {
      const br = Number(a.branchId) - Number(b.branchId)
      if (br !== 0) return br
      return String(a.roomNumber).localeCompare(String(b.roomNumber), undefined, { numeric: true })
    })
    return list
  }, [availableRooms, branchFilter, typeFilter])

  useEffect(() => {
    if (!selectedRoom) return
    const still = filteredRooms.some((r) => r.key === selectedRoom.key)
    if (!still) queueMicrotask(() => setSelectedRoom(null))
  }, [filteredRooms, selectedRoom])

  const resetForm = useCallback(() => {
    setGuestName('')
    setGuestId(readDefaultGuestId() != null ? String(readDefaultGuestId()) : '')
    setCheckInDate(todayYmd())
    setCheckOutDate(addDaysYmd(todayYmd(), 1))
    setFormError('')
  }, [])

  const handleConfirmCheckIn = async (e) => {
    e.preventDefault()
    setFormError('')
    setBanner('')
    if (!selectedRoom) return

    const name = guestName.trim()
    if (!name) {
      setFormError('Enter the guest name on the reservation or walk-in slip.')
      return
    }

    const supabase = getSupabase()
    if (!supabase) {
      setBanner(`Demo mode: would check in ${name} to room ${selectedRoom.roomNumber}.`)
      setSelectedRoom(null)
      resetForm()
      return
    }

    const roomId = selectedRoom.id
    if (roomId == null) {
      setFormError('Missing room id — cannot update the database.')
      return
    }

    const checkIn = new Date(`${checkInDate}T12:00:00`)
    const checkOut = new Date(`${checkOutDate}T12:00:00`)
    if (!(checkIn < checkOut)) {
      setFormError('Check-out must be after check-in.')
      return
    }
    const nights = Math.max(1, Math.round((checkOut - checkIn) / 86400000))
    const total = nights * selectedRoom.pricePerNight

    const gidRaw = String(guestId).trim()
    const gid = gidRaw === '' ? NaN : Number(gidRaw)
    const hasGuestId = Number.isFinite(gid) && gid > 0

    setSubmitting(true)
    try {
      let u = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('roomid', roomId)
        .eq('status', 'available')
        .select('roomid')
      if (u.error) {
        u = await supabase
          .from('rooms')
          .update({ status: 'occupied', updatedat: new Date().toISOString() })
          .eq('roomid', roomId)
          .eq('status', 'available')
          .select('roomid')
      }
      if (u.error) {
        u = await supabase
          .from('rooms')
          .update({ status: 'occupied' })
          .eq('room_id', roomId)
          .eq('status', 'available')
          .select('room_id')
      }
      if (u.error) {
        setFormError(u.error.message)
        return
      }
      if (!u.data?.length) {
        setFormError(
          'This room is no longer available (someone else may have checked in first). Refresh and pick another room.'
        )
        await loadRooms()
        return
      }

      let bookingMsg = ''
      if (hasGuestId) {
        const insert = {
          guestid: gid,
          roomid: roomId,
          checkindate: checkInDate,
          checkoutdate: checkOutDate,
          totalamount: total,
          status: 'confirmed'
        }
        const ins = await supabase.from('bookings').insert(insert).select('bookingid, booking_id')
        if (ins.error) {
          bookingMsg = ` Room is marked occupied, but booking was not saved: ${ins.error.message}`
        } else {
          const row = ins.data?.[0]
          const bid = pick(row, 'bookingid', 'booking_id')
          bookingMsg = ` Booking #${bid ?? '?'} created (${nights} night(s), $${total.toFixed(2)}).`
        }
      } else {
        bookingMsg =
          ' No booking row was created (guest ID empty). Check-out works from bookings — add a booking later if needed.'
      }

      setBanner(
        `${name} checked in to room ${selectedRoom.roomNumber} (${selectedRoom.roomType}).${bookingMsg}`
      )
      setSelectedRoom(null)
      resetForm()
      await loadRooms()
    } finally {
      setSubmitting(false)
    }
  }

  const defGid = readDefaultGuestId()

  return (
    <div className="page-content checkin-page">
      <div className="page-header checkin-page-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Check In</h2>
      </div>

      {!supabaseLive && (
        <div className="room-supabase-banner room-supabase-banner--warn checkin-banner" role="status">
          <strong>Supabase not connected.</strong> Showing demo rooms only — no database updates.{' '}
          {!envFlags.hasUrl && <>Set <code>NEXT_PUBLIC_SUPABASE_URL</code> or <code>VITE_SUPABASE_URL</code>. </>}
          {!envFlags.hasKey && (
            <>Set <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> or <code>VITE_SUPABASE_ANON_KEY</code>. </>
          )}
        </div>
      )}

      {supabaseLive && (
        <div className="checkin-toolbar">
          <span className="checkin-toolbar-meta">
            {loading && rawRooms.length === 0 && 'Loading rooms…'}
            {!loading && (
              <>
                <strong>{availableRooms.length}</strong> available
                {rawRooms.length > 0 && (
                  <>
                    {' '}
                    · <span className="checkin-toolbar-muted">{rawRooms.length} total in table</span>
                  </>
                )}
              </>
            )}
          </span>
          {loadError && <span className="rooms-supabase-error">{loadError}</span>}
          <button type="button" className="checkin-refresh" onClick={() => void loadRooms()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh rooms'}
          </button>
        </div>
      )}

      {banner && (
        <div className="checkin-success" role="status">
          {banner}
        </div>
      )}

      <div className="checkin-filters" role="search" aria-label="Filter available rooms">
        <div className="checkin-filter">
          <label htmlFor="checkin-branch">Branch</label>
          <select
            id="checkin-branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            disabled={!branchOptions.length}
          >
            <option value="all">All branches</option>
            {branchOptions.map((b) => (
              <option key={b} value={String(b)}>
                Branch {b}
              </option>
            ))}
          </select>
        </div>
        <div className="checkin-filter">
          <label htmlFor="checkin-type">Room type</label>
          <select
            id="checkin-type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={!typeOptions.length}
          >
            <option value="all">All types</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <p className="checkin-filter-hint">
          Showing <strong>{filteredRooms.length}</strong> of {availableRooms.length} available
          {branchFilter !== 'all' || typeFilter !== 'all' ? ' (filters applied)' : ''}.
        </p>
      </div>

      {!loading && availableRooms.length === 0 && supabaseLive && (
        <p className="checkin-empty">
          No rooms are currently <code>available</code>. Free a room from Check Out or change status in Supabase.
        </p>
      )}

      <div className={`checkin-layout${selectedRoom ? ' checkin-layout--split' : ''}`}>
        <div className="checkin-rooms-panel">
          <h3 className="checkin-panel-title">Available rooms</h3>
          <div className="checkin-room-grid">
            {filteredRooms.map((room) => {
              const selected = selectedRoom?.key === room.key
              return (
                <button
                  key={room.key}
                  type="button"
                  className={`checkin-room-card${selected ? ' checkin-room-card--selected' : ''}`}
                  onClick={() => {
                    setSelectedRoom(room)
                    setFormError('')
                  }}
                  aria-pressed={selected}
                >
                  <div className="checkin-room-card-thumb">
                    <img src={typeImage(room.roomType)} alt="" />
                  </div>
                  <div className="checkin-room-card-body">
                    <div className="checkin-room-card-top">
                      <span className="checkin-room-number">Room {room.roomNumber}</span>
                      <span className="checkin-room-badge">{room.roomType}</span>
                    </div>
                    <div className="checkin-room-card-meta">
                      <span>Branch {room.branchId ?? '—'}</span>
                      <span>Up to {room.capacity} guest{room.capacity === 1 ? '' : 's'}</span>
                    </div>
                    <div className="checkin-room-price">
                      ${room.pricePerNight.toFixed(2)}
                      <span>/night</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {!filteredRooms.length && availableRooms.length > 0 && (
            <p className="checkin-filter-empty">No rooms match the current filters — set branch and type to All.</p>
          )}
        </div>

        {selectedRoom && (
          <div className="checkin-side-panel">
            <div className="checkin-side-header">
              <h3>Confirm check-in</h3>
              <button type="button" className="checkin-side-close" onClick={() => setSelectedRoom(null)} aria-label="Clear room selection">
                ×
              </button>
            </div>
            <div className="checkin-side-summary">
              <p>
                <strong>Room {selectedRoom.roomNumber}</strong> · {selectedRoom.roomType} · Branch{' '}
                {selectedRoom.branchId ?? '—'}
              </p>
              <p className="checkin-side-muted">
                ${selectedRoom.pricePerNight.toFixed(2)}/night · capacity {selectedRoom.capacity}
              </p>
            </div>

            <form className="checkin-form" onSubmit={handleConfirmCheckIn}>
              <div className="checkin-form-group">
                <label htmlFor="checkin-guest-name">Guest name</label>
                <input
                  id="checkin-guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  autoComplete="name"
                  placeholder="e.g. James Carter"
                  required
                />
              </div>
              <div className="checkin-form-group">
                <label htmlFor="checkin-guest-id">Guest ID (optional)</label>
                <input
                  id="checkin-guest-id"
                  type="text"
                  inputMode="numeric"
                  value={guestId}
                  onChange={(e) => setGuestId(e.target.value)}
                  placeholder={defGid != null ? `default ${defGid} from env` : 'e.g. 85 — must exist in guests'}
                />
                <p className="checkin-field-hint">
                  When set, creates a <code>bookings</code> row (<code>confirmed</code>) for check-out. Leave blank
                  to only mark the room occupied.
                  {defGid != null && (
                    <>
                      {' '}
                      Env default: <code>{defGid}</code>.
                    </>
                  )}
                </p>
              </div>
              <div className="checkin-form-row">
                <div className="checkin-form-group">
                  <label htmlFor="checkin-date-in">Check-in</label>
                  <input
                    id="checkin-date-in"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    required
                  />
                </div>
                <div className="checkin-form-group">
                  <label htmlFor="checkin-date-out">Check-out</label>
                  <input
                    id="checkin-date-out"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              {formError && <p className="checkin-form-error">{formError}</p>}
              <button type="submit" className="submit-btn checkin-submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Complete check-in'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
