import { useState } from 'react'
import './App.css'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import CheckIn from './pages/CheckIn'
import RoomBooking from './pages/RoomBooking'
import Rooms from './pages/Rooms'
import CheckOut from './pages/CheckOut'
import CancelBooking from './pages/CancelBooking'
import Guests from './pages/Guests'
import GuestPortal from './pages/GuestPortal'
import Feedback from './pages/Feedback'
import DigitalKeys from './pages/DigitalKeys'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [userType, setUserType] = useState(null) // 'admin' or 'guest'
  const [user, setUser] = useState(null)
  const [initialRoomType, setInitialRoomType] = useState(null)

  const handleLogin = (type, userData) => {
    setUserType(type)
    setUser(userData)
    setCurrentPage(type === 'admin' ? 'dashboard' : 'guestportal')
  }

  const handleLogout = () => {
    setUserType(null)
    setUser(null)
    setCurrentPage('home')
  }

  const handleNavigate = (page, params = {}) => {
    if (page === 'roombooking') {
      setInitialRoomType(params.roomType || null)
    }
    setCurrentPage(page)
  }

  const handleBack = () => {
    if (userType === 'admin') {
      setCurrentPage('dashboard')
    } else if (userType === 'guest') {
      setCurrentPage('guestportal')
    } else {
      setCurrentPage('home')
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />
      case 'checkin':
        return <CheckIn onBack={handleBack} />
      case 'roombooking':
        return <RoomBooking onBack={handleBack} initialRoomType={initialRoomType} />
      case 'rooms':
        return <Rooms onBack={handleBack} />
      case 'checkout':
        return <CheckOut onBack={handleBack} />
      case 'cancelbooking':
        return <CancelBooking onBack={handleBack} />
      case 'guests':
        return <Guests onBack={handleBack} />
      case 'guestportal':
        return <GuestPortal onNavigate={handleNavigate} onBack={() => setCurrentPage('home')} />
      case 'feedback':
        return <Feedback onBack={handleBack} />
      case 'digitalkeys':
        return <DigitalKeys onBack={handleBack} />
      default:
        return <Home onNavigate={handleNavigate} />
    }
  }

  if (userType === 'admin') {
    return (
      <AdminLayout user={user} onLogout={handleLogout}>
        {renderPage()}
      </AdminLayout>
    )
  }

  return renderPage()
}

export default App
