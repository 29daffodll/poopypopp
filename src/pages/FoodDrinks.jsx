import { useState } from 'react'

const FOOD_ITEMS = [
  { name: 'Continental breakfast', note: 'Pastries, fruit, coffee — 6:30–10:00', price: 'Included / $18' },
  { name: 'All-day dining', note: 'Main restaurant — lunch & dinner menu', price: 'À la carte' },
  { name: 'Room service', note: 'Same menu as restaurant; service charge may apply', price: 'Menu in-room' }
]

const DRINK_ITEMS = [
  { name: 'Lobby bar', note: 'Wine, beer, cocktails — afternoon to late evening', price: 'À la carte' },
  { name: 'Coffee & tea', note: 'Self-service station near reception', price: 'Complimentary' },
  { name: 'Minibar', note: 'Stocked per room category; charges to folio', price: 'Priced in-room' }
]

export default function FoodDrinks({ onBack }) {
  const [section, setSection] = useState('food')

  return (
    <div className="page-content fd-page">
      <div className="page-header">
        <button type="button" className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Food & drinks</h2>
      </div>

      <p className="fd-intro">
        One place for guests and staff: <strong>Food</strong> and <strong>Drinks</strong> on separate tabs below.
        Wire this to menus, hours, and ordering when you add Supabase tables or an external POS.
      </p>

      <div className="fd-tabs" role="tablist" aria-label="Food and drinks">
        <button
          type="button"
          role="tab"
          id="fd-tab-food"
          aria-selected={section === 'food'}
          aria-controls="fd-panel-food"
          className={`fd-tab${section === 'food' ? ' fd-tab--active' : ''}`}
          onClick={() => setSection('food')}
        >
          Food
        </button>
        <button
          type="button"
          role="tab"
          id="fd-tab-drinks"
          aria-selected={section === 'drinks'}
          aria-controls="fd-panel-drinks"
          className={`fd-tab${section === 'drinks' ? ' fd-tab--active' : ''}`}
          onClick={() => setSection('drinks')}
        >
          Drinks
        </button>
      </div>

      <div
        id="fd-panel-food"
        role="tabpanel"
        aria-labelledby="fd-tab-food"
        hidden={section !== 'food'}
        className="fd-panel"
      >
        <h3 className="fd-panel-title">Food service</h3>
        <ul className="fd-menu-list">
          {FOOD_ITEMS.map((item) => (
            <li key={item.name} className="fd-menu-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.note}</p>
              </div>
              <span className="fd-price">{item.price}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        id="fd-panel-drinks"
        role="tabpanel"
        aria-labelledby="fd-tab-drinks"
        hidden={section !== 'drinks'}
        className="fd-panel"
      >
        <h3 className="fd-panel-title">Drinks</h3>
        <ul className="fd-menu-list">
          {DRINK_ITEMS.map((item) => (
            <li key={item.name} className="fd-menu-item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.note}</p>
              </div>
              <span className="fd-price">{item.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
