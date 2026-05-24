import { useEffect, useState } from 'react'

const DEFAULTS = {
  hotelName: 'B Morvie',
  currency: 'PHP',
  defaultStayNights: 2,
  allowGuestSignup: true
}

export default function Settings({ onBack }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState(() => {
    try {
      const s = window.localStorage.getItem('hotelrSettings')
      return s ? JSON.parse(s) : DEFAULTS
    } catch (e) {
      return DEFAULTS
    }
  })

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2500)
      return () => clearTimeout(t)
    }
    return undefined
  }, [saved])

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }))
  }

  const handleSave = () => {
    setSaving(true)
    try {
      window.localStorage.setItem('hotelrSettings', JSON.stringify(form))
      setSaved(true)
    } catch (e) {
      // ignore
    }
    setSaving(false)
  }

  const handleReset = () => {
    setForm(DEFAULTS)
    setSaved(false)
  }

  return (
    <div className="settings-page page-content">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>← Back</button>
        <h2>Site settings</h2>
      </div>

      <div className="settings-grid">
        <section className="settings-panel">
          <h3>General</h3>
          <div className="form-group">
            <label>Hotel name</label>
            <input name="hotelName" value={form.hotelName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={form.currency} onChange={handleChange}>
              <option>PHP</option>
              <option>USD</option>
              <option>EUR</option>
            </select>
          </div>
          <div className="form-group">
            <label>Default stay length (nights)</label>
            <input name="defaultStayNights" type="number" min={1} value={form.defaultStayNights} onChange={handleChange} />
          </div>
          <div className="form-group toggle-group">
            <label>Allow guest sign-up</label>
            <input name="allowGuestSignup" type="checkbox" checked={form.allowGuestSignup} onChange={handleChange} />
          </div>

          <div className="settings-actions">
            <button type="button" className="submit-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            <button type="button" className="link-button" onClick={handleReset}>Reset</button>
            {saved && <span className="settings-saved">Saved</span>}
          </div>
        </section>

        <aside className="settings-preview">
          <h4>Preview</h4>
          <div className="preview-card">
            <strong>{form.hotelName}</strong>
            <p>Default currency: {form.currency}</p>
            <p>Default stay: {form.defaultStayNights} night(s)</p>
            <p>Guest signup: {form.allowGuestSignup ? 'Enabled' : 'Disabled'}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
