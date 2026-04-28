import { useState } from 'react'

export default function CheckOut({ onBack }) {
  const [checkOutData, setCheckOutData] = useState({
    guestName: '',
    roomNumber: '',
    checkOutDate: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setCheckOutData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Check-out confirmed for ${checkOutData.guestName} from Room ${checkOutData.roomNumber}`)
    setCheckOutData({ guestName: '', roomNumber: '', checkOutDate: '' })
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Check Out</h2>
      </div>
      <form onSubmit={handleSubmit} className="page-form">
        <div className="form-group">
          <label>Guest Name</label>
          <input
            type="text"
            name="guestName"
            value={checkOutData.guestName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Room Number</label>
          <input
            type="text"
            name="roomNumber"
            value={checkOutData.roomNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Check-out Date</label>
          <input
            type="date"
            name="checkOutDate"
            value={checkOutData.checkOutDate}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Confirm Check-out</button>
      </form>
    </div>
  )
}
