import { useCallback, useEffect, useMemo, useState } from 'react'
import { getSupabase, getSupabaseEnvFlags, isSupabaseConfigured } from '../lib/supabaseClient'

function pick(row, ...keys) {
  if (!row) return undefined
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null) return row[k]
  }
  return undefined
}

function formatTs(v) {
  if (v == null || v === '') return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 19)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const MOCK_GUESTS = [
  {
    id: 1,
    username: 'james_carter',
    email: 'james@email.com',
    role: 'guest',
    createdAt: '2026-05-13',
    updatedAt: '2026-05-13',
    fromDb: false
  },
  {
    id: 2,
    username: 'emma_wilson',
    email: 'emma@email.com',
    role: 'guest',
    createdAt: '2026-05-12',
    updatedAt: '2026-05-12',
    fromDb: false
  }
]

function normalizeUserRow(row, index) {
  const id = pick(row, 'userid', 'user_id', 'id')
  return {
    id: id != null ? id : `idx-${index}`,
    username: String(pick(row, 'username', 'user_name', 'login') ?? '—'),
    email: String(pick(row, 'email', 'user_email') ?? '—'),
    role: String(pick(row, 'role', 'user_role') ?? 'guest'),
    createdAt: formatTs(pick(row, 'createdat', 'created_at', 'createdAt')),
    updatedAt: formatTs(pick(row, 'updatedat', 'updated_at', 'updatedAt')),
    fromDb: true
  }
}

export default function Guests({ onBack }) {
  const [remoteRows, setRemoteRows] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const supabaseLive = isSupabaseConfigured()
  const envFlags = getSupabaseEnvFlags()

  const loadGuests = useCallback(async () => {
    const supabase = getSupabase()
    if (!supabase) {
      setRemoteRows(null)
      return
    }
    setLoading(true)
    setLoadError('')
    try {
      const { data, error } = await supabase
        .from('users')
        .select('userid, username, email, role, createdat, updatedat')
        .ilike('role', 'guest')
        .limit(500)

      if (error) throw error

      const rows = (data ?? []).slice().sort((a, b) => {
        const ua = String(pick(a, 'username', 'user_name') ?? '').toLowerCase()
        const ub = String(pick(b, 'username', 'user_name') ?? '').toLowerCase()
        return ua.localeCompare(ub)
      })

      setRemoteRows(rows.map((row, i) => normalizeUserRow(row, i)))
    } catch (e) {
      setLoadError(e.message || String(e))
      setRemoteRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadGuests()
    })
  }, [loadGuests])

  const guests = useMemo(() => {
    if (!supabaseLive || remoteRows === null) return MOCK_GUESTS
    return remoteRows
  }, [supabaseLive, remoteRows])

  const liveData = supabaseLive && remoteRows !== null && !loadError

  return (
    <div className="page-content guests-page">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Guests Management</h2>
      </div>

      {supabaseLive && (
        <div className="guests-toolbar">
          {loading && remoteRows === null && <span className="guests-toolbar-status">Loading guests…</span>}
          {loadError && <span className="rooms-supabase-error">{loadError}</span>}
          {liveData && (
            <span className="guests-toolbar-status">
              <strong>{guests.length}</strong> guest user{guests.length === 1 ? '' : 's'}
            </span>
          )}
          <button type="button" className="guests-refresh-btn" onClick={() => void loadGuests()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}

      {!supabaseLive && (
        <div className="room-supabase-banner room-supabase-banner--warn" role="status">
          <strong>Supabase not connected.</strong> Showing sample rows.{' '}
          {!envFlags.hasUrl && <>Add <code>NEXT_PUBLIC_SUPABASE_URL</code>. </>}
          {!envFlags.hasKey && <>Add <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> or anon key. </>}
        </div>
      )}

      <div className="guests-table-wrap">
        <table className="guests-db-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={String(g.id)}>
                <td>{g.id}</td>
                <td>{g.username}</td>
                <td>{g.email}</td>
                <td>{g.role}</td>
                <td>{g.createdAt}</td>
                <td>{g.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && guests.length === 0 && (
        <p className="guests-empty">No guest users found. Check RLS policies and that rows use role &apos;guest&apos;.</p>
      )}
    </div>
  )
}
