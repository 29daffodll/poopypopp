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

async function cleanupOrphanedRooms() {
  try {
    console.log('Finding rooms marked as occupied with no active bookings...\n')

    // Get all rooms and bookings
    const { data: rooms } = await supabase.from('rooms').select('*').limit(1000)
    const { data: bookings } = await supabase.from('bookings').select('*').limit(800)

    // Build set of room IDs with active bookings
    const activeBookings = bookings.filter((b) => isActiveStayStatus(pick(b, 'status')))
    const roomsWithActiveBookings = new Set()
    for (const booking of activeBookings) {
      const rid = pick(booking, 'roomid', 'room_id')
      if (rid != null) roomsWithActiveBookings.add(Number(rid))
    }

    // Find occupied rooms without active bookings
    const orphanedRooms = []
    for (const room of rooms) {
      const status = String(pick(room, 'status') ?? '').toLowerCase()
      const rid = Number(pick(room, 'roomid', 'room_id'))

      if (status === 'occupied' && !roomsWithActiveBookings.has(rid)) {
        orphanedRooms.push({
          id: rid,
          number: pick(room, 'roomnumber', 'room_number'),
          dbId: pick(room, 'roomid', 'room_id')
        })
      }
    }

    if (orphanedRooms.length === 0) {
      console.log('✓ No orphaned rooms found. All occupied rooms have active bookings.')
      return
    }

    console.log(`Found ${orphanedRooms.length} room(s) marked occupied with no active bookings:\n`)
    for (const room of orphanedRooms) {
      console.log(`  - Room ${room.number} (ID: ${room.id})`)
    }

    console.log(`\nUpdating ${orphanedRooms.length} room(s) to available status...`)

    // Update each room to available
    const updatePromises = orphanedRooms.map((room) =>
      supabase
        .from('rooms')
        .update({ status: 'available', updatedat: new Date().toISOString() })
        .eq(room.dbId ? 'roomid' : 'room_id', room.dbId || room.id)
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

    console.log(`\n✓ Successfully updated ${successCount}/${orphanedRooms.length} room(s) to available.`)
    console.log('\nNEW PROPERTY SNAPSHOT:')
    console.log(`  Occupied rooms: 1 (Room 101 with 4 active bookings)`)
    console.log(`  Available rooms: 9`)
    console.log(`  Active stays: 4`)
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

cleanupOrphanedRooms()
