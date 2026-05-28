import { useCallback, useEffect, useRef, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

function isActiveStayStatus(status) {
  const s = String(status ?? '').toLowerCase()
  return s === 'confirmed' || s === 'pending' || s === 'active'
}

const POLL_MS = 30_000

export default function Sidebar({ user, onLogout }) {
  const [clock, setClock] = useState(() => new Date())
  const [lastSync, setLastSync] = useState(null)
  const [rooms, setRooms] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    other: 0,
    branches: 0
  })
  const [activeStays, setActiveStays] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [liveMode, setLiveMode] = useState(() => (isSupabaseConfigured() ? 'poll' : 'off'))
  const firstLoad = useRef(true)
  const debounceLoad = useRef(null)

  const supabaseOk = isSupabaseConfigured()

  const loadSnapshot = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setLiveMode('off')
      setError('')
      return
    }

    if (firstLoad.current) setLoading(true)
    setError('')

    try {
      const { data: roomRows, error: rErr } = await supabase.from('rooms').select('*').limit(1000)
      if (rErr) throw rErr

      const { data: bookingRows, error: bErr } = await supabase.from('bookings').select('*').limit(800)
      if (bErr) throw bErr

      // Build set of room IDs that have active bookings
      const activeBookings = (bookingRows ?? []).filter((b) => isActiveStayStatus(pick(b, 'status')))
      const roomsWithActiveBookings = new Set()
      for (const booking of activeBookings) {
        const rid = pick(booking, 'roomid', 'room_id')
        if (rid != null) roomsWithActiveBookings.add(Number(rid))
      }
      setActiveStays(activeBookings.length)

      let available = 0
      let occupied = 0
      let maintenance = 0
      let other = 0
      const branchSet = new Set()
      for (const row of roomRows ?? []) {
        const st = String(pick(row, 'status') ?? '').toLowerCase()
        const rid = pick(row, 'roomid', 'room_id')
        const hasActiveBooking = rid != null && roomsWithActiveBookings.has(Number(rid))

        // Count as occupied if status is occupied OR has an active booking
        if (hasActiveBooking || st === 'occupied') {
          occupied += 1
        } else if (st === 'available') {
          available += 1
        } else if (st === 'maintenance' || st === 'cleaning' || st === 'dirty') {
          maintenance += 1
        } else {
          other += 1
        }

        const bid = pick(row, 'branchid', 'branch_id')
        if (bid != null && Number.isFinite(Number(bid))) branchSet.add(Number(bid))
      }
      const total = (roomRows ?? []).length
      setRooms({
        total,
        available,
        occupied,
        maintenance,
        other,
        branches: branchSet.size
      })

      const rev = await supabase.from('reviews').select('*', { count: 'exact', head: true })
      if (!rev.error && typeof rev.count === 'number') {
        setReviewsCount(rev.count)
      } else {
        setReviewsCount(null)
      }

      setLastSync(new Date())
    } catch (e) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
      firstLoad.current = false
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadSnapshot()
    })
  }, [loadSnapshot])

  useEffect(() => {
    if (!supabaseOk) return undefined

    const supabase = getSupabase()
    if (!supabase) {
      queueMicrotask(() => setLiveMode('off'))
      return undefined
    }

    const poll = setInterval(() => {
      void loadSnapshot()
    }, POLL_MS)

    const scheduleLoad = () => {
      if (debounceLoad.current) clearTimeout(debounceLoad.current)
      debounceLoad.current = setTimeout(() => {
        debounceLoad.current = null
        void loadSnapshot()
      }, 450)
    }

    const channel = supabase
      .channel('admin-sidebar-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, scheduleLoad)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, scheduleLoad)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, scheduleLoad)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setLiveMode('realtime')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setLiveMode('poll')
        }
      })

    return () => {
      clearInterval(poll)
      if (debounceLoad.current) clearTimeout(debounceLoad.current)
      void supabase.removeChannel(channel)
    }
  }, [supabaseOk, loadSnapshot])

  const total = rooms.total || 0
  const availPct = total ? Math.round((rooms.available / total) * 100) : 0
  const occPct = total ? Math.round((rooms.occupied / total) * 100) : 0
  const availDeg = total ? (rooms.available / total) * 360 : 0
  const occDeg = total ? (rooms.occupied / total) * 360 : 0

  const liveLabel =
    liveMode === 'realtime' ? 'Live (Realtime)' : liveMode === 'poll' ? 'Live (polling)' : 'Demo / offline'

  return (
    <aside className="sidebar">
      <div className="user-info">
        <p className="sidebar-user-name">
          <strong>{user?.name ?? 'Admin'}</strong>
        </p>
        {user?.rank && (
          <p className="sidebar-user-meta">
            <span className="sidebar-user-label">Role</span> {user.rank}
          </p>
        )}
        {user?.email && (
          <p className="sidebar-user-meta">
            <span className="sidebar-user-label">Email</span> {user.email}
          </p>
        )}
      </div>

      <div className="sidebar-live-card">
        <div className="sidebar-live-row">
          <span className={`sidebar-live-dot sidebar-live-dot--${liveMode === 'off' ? 'off' : 'on'}`} aria-hidden />
          <span className="sidebar-live-label">{liveLabel}</span>
        </div>
        <p className="sidebar-clock">{clock.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
        {lastSync && (
          <p className="sidebar-sync">
            Data synced {lastSync.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        )}
        {loading && <p className="sidebar-sync">Loading snapshot…</p>}
        {error && <p className="sidebar-error">{error}</p>}
        {!supabaseOk && (
          <p className="sidebar-sync sidebar-sync--hint">
            Add Supabase env vars to show live room and booking counts.
          </p>
        )}
      </div>

      <div className="sidebar-metrics">
        <h4 className="sidebar-metrics-title">Property snapshot</h4>
        <ul className="sidebar-metric-list">
          <li>
            <span>Rooms tracked</span>
            <strong>{supabaseOk ? rooms.total : '—'}</strong>
          </li>
          <li>
            <span>Branches</span>
            <strong>{supabaseOk ? rooms.branches : '—'}</strong>
          </li>
          <li className="sidebar-metric--ok">
            <span>Available</span>
            <strong>{supabaseOk ? rooms.available : '—'}</strong>
          </li>
          <li className="sidebar-metric--busy">
            <span>Occupied</span>
            <strong>{supabaseOk ? rooms.occupied : '—'}</strong>
          </li>
          <li>
            <span>Maintenance / other</span>
            <strong>{supabaseOk ? rooms.maintenance + rooms.other : '—'}</strong>
          </li>
          <li>
            <span>Active stays</span>
            <strong title="Bookings with status confirmed or active">{supabaseOk ? activeStays : '—'}</strong>
          </li>
          <li>
            <span>Reviews</span>
            <strong>{supabaseOk && reviewsCount != null ? reviewsCount : '—'}</strong>
          </li>
        </ul>
      </div>

      <div className="stats-section sidebar-rings">
        <div className="stat-card">
          <div
            className="pie-chart available"
            style={{
              background: total
                ? `conic-gradient(#2e7d32 0deg ${availDeg}deg, #e8f5e9 ${availDeg}deg)`
                : '#e8f5e9'
            }}
          >
            <div className="pie-text">{availPct}%</div>
          </div>
          <p>Available share</p>
        </div>

        <div className="stat-card">
          <div
            className="pie-chart reserved"
            style={{
              background: total
                ? `conic-gradient(#c62828 0deg ${occDeg}deg, #ffebee ${occDeg}deg)`
                : '#ffebee'
            }}
          >
            <div className="pie-text">{occPct}%</div>
          </div>
          <p>Occupied share</p>
        </div>
      </div>

      <button type="button" className="sidebar-refresh-ghost" onClick={() => void loadSnapshot()} disabled={!supabaseOk || loading}>
        Refresh stats
      </button>

      <button type="button" className="logout-btn" onClick={onLogout}>
        <span className="power-icon" aria-hidden>
          ⏻
        </span>{' '}
        Log Out
      </button>
    </aside>
  )
}
