import { useEffect, useState } from 'react'
import { getSupabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { isStripeConfigured } from '../lib/stripeClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

function parseAmount(v) {
  if (v == null) return NaN
  if (typeof v === 'number') return v
  const s = String(v)
  const m = s.replace(/[₱,\s]/g, '').match(/[-+]?\d+(?:\.\d+)?/)
  return m ? Number(m[0]) : NaN
}

export default function GuestCheckout({ onBack }) {
  const [booking, setBooking] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [banner, setBanner] = useState('')

  const supabaseLive = isSupabaseConfigured()
  const stripeEnabled = isStripeConfigured()

  useEffect(() => {
    // Handle post-Stripe redirect (success / cancel)
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get('payment')
    if (paymentStatus === 'success') {
      const stored = sessionStorage.getItem('stripeCheckoutBookingData')
      if (stored) {
        try {
          const bookingData = JSON.parse(stored)
          setBanner('Payment successful — completing checkout…')
          ;(async () => {
            const supabase = getSupabase()
            if (!supabase) {
              setError('Supabase is not configured.')
              return
            }
            const bid = bookingData.bookingId ?? bookingData.bookingid ?? bookingData.id
            const roomId = bookingData.roomid ?? bookingData.room_id
            if (bid == null) {
              setBanner('Could not read booking id from payment data.')
              return
            }
            const today = new Date()
            const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

            let res = await supabase.from('bookings').update({ status: 'completed', checkoutdate: ymd }).eq('bookingid', bid)
            if (res.error) {
              res = await supabase.from('bookings').update({ status: 'completed', checkoutdate: ymd }).eq('booking_id', bid)
            }
            if (res.error) {
              setError(res.error.message || String(res.error))
              return
            }

            if (roomId != null) {
              const r1 = await supabase.from('rooms').update({ status: 'available' }).eq('roomid', roomId)
              if (r1.error) {
                await supabase.from('rooms').update({ status: 'available' }).eq('room_id', roomId)
              }
            }

            setBanner(`Booking #${bid} checked out. Thank you!`)
            sessionStorage.removeItem('stripeCheckoutBookingId')
            sessionStorage.removeItem('stripeCheckoutBookingData')
            window.history.replaceState({}, document.title, window.location.pathname)
          })()
        } catch (e) {
          console.error('Failed to parse stored booking data:', e)
        }
      }
    } else if (paymentStatus === 'cancel') {
      setBanner('Payment cancelled. Your booking was not checked out.')
      sessionStorage.removeItem('stripeCheckoutBookingId')
      sessionStorage.removeItem('stripeCheckoutBookingData')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    // end payment redirect handling

    // Load booking data saved by the guest portal into sessionStorage
    const stored = sessionStorage.getItem('stripeCheckoutBookingData')
    const id = sessionStorage.getItem('stripeCheckoutBookingId')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setBooking({ ...parsed, bookingId: parsed.bookingId ?? parsed.id ?? id })
        return
      } catch (e) {
        // fall through to trying to fetch by id
      }
    }

    if (id && supabaseLive) {
      ;(async () => {
        try {
          setLoading(true)
          const supabase = getSupabase()
          if (!supabase) return
          const { data, error: qErr } = await supabase.from('bookings').select('*').eq('bookingid', Number(id)).limit(1)
          if (qErr) {
            // try alternate key
            const { data: d2, error: qErr2 } = await supabase.from('bookings').select('*').eq('booking_id', id).limit(1)
            if (!qErr2 && Array.isArray(d2) && d2.length) {
              setBooking(d2[0])
            }
          } else if (Array.isArray(data) && data.length) {
            setBooking(data[0])
          }
        } catch (e) {
          // ignore
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [supabaseLive])

  const startStripeCheckout = async () => {
    setError('')
    // Avoid mixing nullish coalescing (??) with logical OR (||) in one expression
    let bid = sessionStorage.getItem('stripeCheckoutBookingId') || null
    if (booking) {
      bid = booking.bookingId ?? booking.bookingid ?? booking.id ?? bid
    }
    const rawAmount = booking?.totalamount ?? booking?.total_amount ?? booking?.price ?? booking?.total
    const amount = parseAmount(rawAmount)

    if (!stripeEnabled) {
      setError('Stripe is not configured. Contact support.')
      return
    }
    if (!bid || !Number.isFinite(amount) || amount <= 0) {
      setError('Missing booking id or valid amount.')
      return
    }

    try {
      setRedirecting(true)
      // ensure the session storage keys used by the backend/admin flow are present
      sessionStorage.setItem('stripeCheckoutBookingId', String(bid))
      sessionStorage.setItem('stripeCheckoutBookingData', JSON.stringify(booking))

      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bid, amount, currency: 'php', description: `Booking #${bid}` })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload?.error || payload?.message || 'Stripe checkout failed.')
      if (!payload?.url) throw new Error('No checkout URL returned from server.')
      window.location.href = payload.url
    } catch (e) {
      setError(e?.message || String(e))
      setRedirecting(false)
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>← Back</button>
        <h2>Check Out</h2>
      </div>

      {error && <p className="booking-form-error checkout-banner">{error}</p>}
      {banner && <p className="checkout-banner checkout-banner--ok">{banner}</p>}

      {!stripeEnabled && (
        <p className="room-supabase-banner room-supabase-banner--warn" role="status">
          Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY.
        </p>
      )}

      {loading && <p className="room-db-bookings-muted">Loading booking…</p>}

      {!loading && !booking && (
        <p className="room-db-bookings-muted">No booking selected. Start from the guest portal and choose a booking to pay.</p>
      )}

      {booking && (
        <div className="guest-checkout-card">
          <div className="detail-grid">
            <div className="detail-item"><label>Booking</label><p>{booking.bookingId ?? booking.bookingid ?? booking.id}</p></div>
            <div className="detail-item"><label>Room</label><p>{booking.roomNumber ?? booking.roomnumber ?? booking.room}</p></div>
            <div className="detail-item"><label>Check-in</label><p>{booking.checkIn ?? booking.checkindate ?? booking.checkin}</p></div>
            <div className="detail-item"><label>Check-out</label><p>{booking.checkOut ?? booking.checkoutdate ?? booking.checkout}</p></div>
            <div className="detail-item"><label>Total</label><p>{String(rawAmountOrPrice(booking))}</p></div>
            <div className="detail-item"><label>Status</label><p>{String(pick(booking, 'status') ?? '—')}</p></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="button" className="submit-btn checkout-btn" disabled={redirecting} onClick={() => void startStripeCheckout()}>
              {redirecting ? 'Redirecting…' : 'Pay with Stripe'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function rawAmountOrPrice(b) {
  return b?.totalamount ?? b?.total_amount ?? b?.price ?? b?.total ?? '—'
}
