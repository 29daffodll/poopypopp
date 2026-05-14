import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase, getSupabaseEnvFlags, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

const MOCK_REVIEWS = [
  {
    id: 1,
    bookingId: 'BK001',
    guestName: 'John Smith',
    room: '101 - Suite',
    date: '2026-04-18',
    overallRating: 5,
    cleanlinessRating: 5,
    serviceRating: 4,
    comfortRating: 5,
    amenitiesRating: 5,
    feedback: 'Excellent stay! The suite was spacious and well-maintained. Staff was very helpful.',
    wouldRecommend: 'yes',
    fromDb: false
  },
  {
    id: 2,
    bookingId: 'BK002',
    guestName: 'Emma Johnson',
    room: '205 - Double',
    date: '2026-04-12',
    overallRating: 4,
    cleanlinessRating: 4,
    serviceRating: 5,
    comfortRating: 4,
    amenitiesRating: 4,
    feedback: 'Very comfortable stay. Good service and clean rooms. Would definitely come back.',
    wouldRecommend: 'yes',
    fromDb: false
  },
  {
    id: 3,
    bookingId: 'BK003',
    guestName: 'Michael Brown',
    room: '103 - Single',
    date: '2026-04-07',
    overallRating: 5,
    cleanlinessRating: 5,
    serviceRating: 5,
    comfortRating: 5,
    amenitiesRating: 4,
    feedback: 'Perfect for a business trip. Great location, friendly staff, and quality amenities.',
    wouldRecommend: 'yes',
    fromDb: false
  },
  {
    id: 4,
    bookingId: 'BK004',
    guestName: 'Sarah Davis',
    room: '101 - Suite',
    date: '2026-03-30',
    overallRating: 3,
    cleanlinessRating: 4,
    serviceRating: 3,
    comfortRating: 4,
    amenitiesRating: 3,
    feedback: 'Decent accommodation. Some areas could use improvement but overall satisfactory.',
    wouldRecommend: 'yes',
    fromDb: false
  }
]

function normalizeReviewRow(row, guestNames, bookingRoomLabels, index) {
  const rid = pick(row, 'reviewid', 'review_id', 'id')
  const gid = pick(row, 'guestid', 'guest_id')
  const bid = pick(row, 'bookingid', 'booking_id')
  const rating = Number(pick(row, 'rating')) || 0
  const comment = String(pick(row, 'comment', 'comments') ?? '')
  const created = pick(row, 'createdat', 'created_at', 'createdAt')
  const dateStr = created ? String(created).slice(0, 10) : new Date().toISOString().slice(0, 10)
  const guestName =
    gid != null
      ? guestNames.get(Number(gid)) ?? guestNames.get(String(gid)) ?? `Guest ${gid}`
      : 'Guest'
  const room =
    bid != null
      ? bookingRoomLabels.get(Number(bid)) ??
        bookingRoomLabels.get(String(bid)) ??
        `Booking #${bid}`
      : '—'

  return {
    id: rid != null ? rid : `idx-${index}`,
    bookingId: bid != null ? String(bid) : '—',
    guestName,
    room,
    date: dateStr,
    overallRating: rating,
    cleanlinessRating: rating,
    serviceRating: rating,
    comfortRating: rating,
    amenitiesRating: rating,
    feedback: comment,
    wouldRecommend: 'yes',
    fromDb: true
  }
}

function renderStars(rating) {
  const n = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)))
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`star ${star <= n ? 'filled' : 'empty'}`}>
          ★
        </span>
      ))}
      <span className="rating-value">{n}/5</span>
    </div>
  )
}

export default function Reviews({ onBack }) {
  const [remoteRows, setRemoteRows] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [filterRoom, setFilterRoom] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const supabaseLive = isSupabaseConfigured()
  const envFlags = getSupabaseEnvFlags()

  const loadReviews = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setRemoteRows(null)
      return
    }
    setLoading(true)
    setLoadError('')
    try {
      const { data: revData, error: rErr } = await supabase.from('reviews').select('*').limit(200)
      if (rErr) throw rErr

      const rows = revData ?? []
      rows.sort((a, b) => {
        const ta = new Date(pick(a, 'createdat', 'created_at', 'createdAt') || 0).getTime()
        const tb = new Date(pick(b, 'createdat', 'created_at', 'createdAt') || 0).getTime()
        return tb - ta
      })

      const bookingIds = [...new Set(rows.map((x) => pick(x, 'bookingid', 'booking_id')).filter((x) => x != null))]
      const guestIds = [...new Set(rows.map((x) => pick(x, 'guestid', 'guest_id')).filter((x) => x != null))]

      const guestNames = new Map()
      if (guestIds.length) {
        const gRes = await supabase.from('guests').select('*').limit(500)
        if (!gRes.error && gRes.data) {
          for (const g of gRes.data) {
            const id = pick(g, 'guestid', 'guest_id', 'id')
            if (id == null) continue
            const name =
              pick(g, 'guestname', 'guest_name', 'name', 'fullname', 'firstname') ?? `Guest #${id}`
            guestNames.set(Number(id), String(name))
            guestNames.set(String(id), String(name))
          }
        }
      }

      const bookingRoomLabels = new Map()
      const roomById = new Map()
      const { data: roomRows } = await supabase.from('rooms').select('*')
      for (const rm of roomRows ?? []) {
        const id = pick(rm, 'roomid', 'room_id')
        if (id == null) continue
        const num = pick(rm, 'roomnumber', 'room_number')
        const typ = pick(rm, 'roomtype', 'room_type')
        const label = typ != null ? `${num ?? id} — ${typ}` : String(num ?? id)
        roomById.set(Number(id), label)
        roomById.set(String(id), label)
      }

      if (bookingIds.length) {
        let bRes = await supabase.from('bookings').select('*').in('bookingid', bookingIds)
        if (bRes.error) {
          bRes = await supabase.from('bookings').select('*').in('booking_id', bookingIds)
        }
        if (!bRes.error && bRes.data) {
          for (const b of bRes.data) {
            const bid = pick(b, 'bookingid', 'booking_id')
            const roomId = pick(b, 'roomid', 'room_id')
            if (bid == null) continue
            const label =
              roomId != null
                ? roomById.get(Number(roomId)) ?? roomById.get(String(roomId)) ?? `Room ${roomId}`
                : `Booking #${bid}`
            bookingRoomLabels.set(Number(bid), label)
            bookingRoomLabels.set(String(bid), label)
          }
        }
      }

      const normalized = rows.map((row, index) => normalizeReviewRow(row, guestNames, bookingRoomLabels, index))
      setRemoteRows(normalized)
    } catch (e) {
      setLoadError(e.message || String(e))
      setRemoteRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadReviews()
    })
  }, [loadReviews])

  const reviews = useMemo(() => {
    if (!supabaseLive || remoteRows === null) return MOCK_REVIEWS
    return remoteRows
  }, [supabaseLive, remoteRows])

  const averageRatings = useMemo(() => {
    if (!reviews.length) {
      return { overall: '0', cleanliness: '0', service: '0', comfort: '0', amenities: '0' }
    }
    const n = reviews.length
    const o = reviews.reduce((s, r) => s + r.overallRating, 0) / n
    return {
      overall: o.toFixed(1),
      cleanliness: (reviews.reduce((s, r) => s + r.cleanlinessRating, 0) / n).toFixed(1),
      service: (reviews.reduce((s, r) => s + r.serviceRating, 0) / n).toFixed(1),
      comfort: (reviews.reduce((s, r) => s + r.comfortRating, 0) / n).toFixed(1),
      amenities: (reviews.reduce((s, r) => s + r.amenitiesRating, 0) / n).toFixed(1)
    }
  }, [reviews])

  const uniqueRooms = useMemo(() => ['all', ...new Set(reviews.map((r) => r.room))], [reviews])

  const filteredReviews = useMemo(() => {
    let list = filterRoom === 'all' ? [...reviews] : reviews.filter((r) => r.room === filterRoom)
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.date) - new Date(a.date))
    } else if (sortBy === 'rating-high') {
      list.sort((a, b) => b.overallRating - a.overallRating)
    } else if (sortBy === 'rating-low') {
      list.sort((a, b) => a.overallRating - b.overallRating)
    }
    return list
  }, [reviews, filterRoom, sortBy])

  const liveData = supabaseLive && remoteRows !== null && !loadError

  return (
    <div className="page-content reviews-page">
      <div className="page-header reviews-page-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="reviews-page-heading">
          <h2>Guest Reviews</h2>
          {liveData && <p className="reviews-page-tagline">Synced from Supabase</p>}
        </div>
      </div>

      {supabaseLive && (
        <div className="reviews-toolbar">
          {loading && remoteRows === null && <span className="reviews-toolbar-status">Loading reviews…</span>}
          {loadError && <span className="rooms-supabase-error">{loadError}</span>}
          {liveData && (
              <span className="reviews-toolbar-status">
              <strong>{reviews.length}</strong> row{reviews.length === 1 ? '' : 's'} from{' '}
              <span className="reviews-kbd">reviews</span> · guest and room labels when joins resolve
            </span>
          )}
          <button
            type="button"
            className="reviews-refresh-btn"
            onClick={() => void loadReviews()}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}

      {!supabaseLive && (
        <div className="room-supabase-banner room-supabase-banner--warn reviews-offline-note" role="status">
          <strong>Supabase not connected.</strong> Showing demo reviews.{' '}
          {!envFlags.hasUrl && <>Add <code>NEXT_PUBLIC_SUPABASE_URL</code>. </>}
          {!envFlags.hasKey && <>Add <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> or anon key. </>}
        </div>
      )}

      <div className="reviews-summary">
        <div className="summary-card summary-card--featured">
          <h3>Overall Rating</h3>
          {renderStars(Math.round(Number(averageRatings.overall)))}
          <p className="summary-value">{averageRatings.overall}</p>
          <p className="summary-text">{reviews.length} reviews</p>
        </div>
        <div className="summary-card">
          <h3>Cleanliness</h3>
          {renderStars(Math.round(Number(averageRatings.cleanliness)))}
          <p className="summary-value">{averageRatings.cleanliness}</p>
        </div>
        <div className="summary-card">
          <h3>Service Quality</h3>
          {renderStars(Math.round(Number(averageRatings.service)))}
          <p className="summary-value">{averageRatings.service}</p>
        </div>
        <div className="summary-card">
          <h3>Comfort</h3>
          {renderStars(Math.round(Number(averageRatings.comfort)))}
          <p className="summary-value">{averageRatings.comfort}</p>
        </div>
        <div className="summary-card">
          <h3>Amenities</h3>
          {renderStars(Math.round(Number(averageRatings.amenities)))}
          <p className="summary-value">{averageRatings.amenities}</p>
        </div>
      </div>

      {liveData && (
        <aside className="reviews-callout" role="note">
          <span className="reviews-callout-icon" aria-hidden="true">
            i
          </span>
          <p>
            Your <span className="reviews-kbd">reviews</span> table stores one <span className="reviews-kbd">rating</span>{' '}
            per row. Category tiles above repeat that value until you add separate score columns.
          </p>
        </aside>
      )}

      <div className="reviews-filters">
        <div className="filter-group">
          <label htmlFor="reviews-filter-room">Room</label>
          <select id="reviews-filter-room" value={filterRoom} onChange={(e) => setFilterRoom(e.target.value)}>
            {uniqueRooms.map((room) => (
              <option key={room} value={room}>
                {room === 'all' ? 'All rooms' : room}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="reviews-sort">Sort</label>
          <select id="reviews-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most recent</option>
            <option value="rating-high">Highest rating</option>
            <option value="rating-low">Lowest rating</option>
          </select>
        </div>
      </div>

      <div className="reviews-list">
        {filteredReviews.map((review) => (
          <article
            key={String(review.id)}
            className={`review-card${review.fromDb ? ' review-card--db' : ''}`}
          >
            <header className="review-header">
              <div className="review-header-main">
                <div className="review-header-row">
                  <h3>{review.guestName}</h3>
                  <time className="review-date" dateTime={review.date}>
                    {new Date(review.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <p className="review-room">{review.room}</p>
                {review.fromDb && (
                  <span className="review-booking-badge">Booking {review.bookingId}</span>
                )}
              </div>
            </header>

            <div className="review-overall">
              <span className="review-label">Rating</span>
              {renderStars(review.overallRating)}
            </div>

            {!review.fromDb && (
              <div className="review-ratings-grid">
                <div className="rating-item">
                  <span>Cleanliness</span>
                  {renderStars(review.cleanlinessRating)}
                </div>
                <div className="rating-item">
                  <span>Service</span>
                  {renderStars(review.serviceRating)}
                </div>
                <div className="rating-item">
                  <span>Comfort</span>
                  {renderStars(review.comfortRating)}
                </div>
                <div className="rating-item">
                  <span>Amenities</span>
                  {renderStars(review.amenitiesRating)}
                </div>
              </div>
            )}

            <p className="review-text">{review.feedback}</p>

            {!review.fromDb && (
              <div className="review-recommend">
                <span className="recommend-badge">
                  {review.wouldRecommend === 'yes' ? '✓ Would Recommend' : '✗ Would Not Recommend'}
                </span>
              </div>
            )}
          </article>
        ))}
      </div>

      {!loading && filteredReviews.length === 0 && (
        <div className="no-reviews">
          <p>No reviews found for the selected criteria.</p>
        </div>
      )}
    </div>
  )
}
