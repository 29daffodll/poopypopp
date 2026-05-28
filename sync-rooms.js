import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function isActiveStayStatus(status) {
  const s = String(status ?? '').toLowerCase()
  return s === 'confirmed' || s === 'pending' || s === 'active'
}

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

async function syncRooms() {
  try {
    console.log('Fetching active bookings...')
    const { data: bookings, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .limit(800)

    if (bErr) throw bErr

    const activeBookings = bookings.filter((b) => isActiveStayStatus(pick(b, 'status')))
    console.log(`Found ${activeBookings.length} active bookings`)

    if (activeBookings.length === 0) {
      console.log('No active bookings found. Nothing to sync.')
      return
    }

    const roomIdsToUpdate = new Set()
    for (const booking of activeBookings) {
      const rid = pick(booking, 'roomid', 'room_id')
      if (rid != null) {
        roomIdsToUpdate.add(Number(rid))
      }
    }

    console.log(`Checking ${roomIdsToUpdate.size} rooms with active bookings...`)

    const { data: rooms, error: rErr } = await supabase
      .from('rooms')
      .select('*')
      .limit(1000)

    if (rErr) throw rErr

    const roomsToUpdate = []
    for (const room of rooms) {
      const rid = pick(room, 'roomid', 'room_id')
      const status = String(pick(room, 'status') ?? '').toLowerCase()

      if (rid != null && roomIdsToUpdate.has(Number(rid)) && status !== 'occupied') {
        roomsToUpdate.push({
          id: rid,
          number: pick(room, 'roomnumber', 'room_number'),
          currentStatus: status
        })
      }
    }

    if (roomsToUpdate.length === 0) {
      console.log('✓ All rooms with active bookings are already marked as occupied.')
      return
    }

    console.log(`\nFound ${roomsToUpdate.length} room(s) to update:`)
    for (const room of roomsToUpdate) {
      console.log(`  - Room ${room.number} (ID: ${room.id}, current status: ${room.currentStatus})`)
    }

    console.log('\nUpdating rooms to occupied status...')
    const updatePromises = roomsToUpdate.map((room) =>
      supabase
        .from('rooms')
        .update({ status: 'occupied', updatedat: new Date().toISOString() })
        .eq(pick(room, 'roomid') ? 'roomid' : 'room_id', room.id)
    )

    const results = await Promise.all(updatePromises)

    let successCount = 0
    for (const result of results) {
      if (result.error) {
        console.error(`✗ Update failed: ${result.error.message}`)
      } else {
        successCount++
      }
    }

    console.log(`\n✓ Successfully updated ${successCount}/${roomsToUpdate.length} room(s) to occupied.`)
  } catch (error) {
    console.error('Error syncing rooms:', error.message)
    process.exit(1)
  }
}

syncRooms()
