import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

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

async function checkStatus() {
  try {
    console.log('Checking database state...\n')

    // Get room stats
    const { data: rooms } = await supabase.from('rooms').select('*').limit(1000)
    const occupiedCount = rooms.filter((r) => String(pick(r, 'status') ?? '').toLowerCase() === 'occupied').length
    const availableCount = rooms.filter((r) => String(pick(r, 'status') ?? '').toLowerCase() === 'available').length

    console.log('ROOMS TABLE:')
    console.log(`  Total rooms: ${rooms.length}`)
    console.log(`  Occupied: ${occupiedCount}`)
    console.log(`  Available: ${availableCount}`)

    // Get booking stats
    const { data: bookings } = await supabase.from('bookings').select('*').limit(800)
    const activeBookings = bookings.filter((b) => isActiveStayStatus(pick(b, 'status')))

    console.log('\nBOOKINGS TABLE:')
    console.log(`  Total bookings: ${bookings.length}`)
    console.log(`  Active bookings (confirmed/pending/active): ${activeBookings.length}`)

    console.log('\nACTIVE BOOKINGS DETAIL:')
    for (const booking of activeBookings) {
      const bid = pick(booking, 'bookingid', 'booking_id')
      const rid = pick(booking, 'roomid', 'room_id')
      const status = pick(booking, 'status')
      console.log(`  - Booking ${bid}: Room ${rid}, Status: ${status}`)
    }

    // Check if those rooms are marked as occupied
    const roomsInActiveBookings = new Set()
    for (const booking of activeBookings) {
      const rid = pick(booking, 'roomid', 'room_id')
      if (rid != null) roomsInActiveBookings.add(Number(rid))
    }

    console.log('\nROOM STATUS CHECK FOR ACTIVE BOOKINGS:')
    for (const roomId of roomsInActiveBookings) {
      const room = rooms.find((r) => Number(pick(r, 'roomid', 'room_id')) === roomId)
      if (room) {
        const status = pick(room, 'status')
        const number = pick(room, 'roomnumber', 'room_number')
        console.log(`  - Room ${number} (ID: ${roomId}): ${status}`)
      }
    }

    console.log('\nPROPERTY SNAPSHOT (as calculated):')
    console.log(`  Occupied (rooms marked occupied OR have active booking): ${new Set(Array.from(roomsInActiveBookings).concat([...rooms.filter((r) => String(pick(r, 'status') ?? '').toLowerCase() === 'occupied').map((r) => Number(pick(r, 'roomid', 'room_id')))]).filter((id) => id)).size}`)
    console.log(`  Active stays (bookings with confirmed/pending/active status): ${activeBookings.length}`)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

checkStatus()
