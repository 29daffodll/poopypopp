import { useEffect, useState } from 'react'
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
import Reviews from './pages/Reviews'
import Housekeeping from './pages/Housekeeping'
import FoodDrinks from './pages/FoodDrinks'
import Settings from './pages/Settings'

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = window.localStorage.getItem('hotelrCurrentPage')
    return savedPage || 'home'
  })
  const [userType, setUserType] = useState(() => window.localStorage.getItem('hotelrUserType')) // 'admin' or 'guest'
  const [user, setUser] = useState(() => {
    const savedUser = window.localStorage.getItem('hotelrUser')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [initialRoomType, setInitialRoomType] = useState(null)
  const [initialCheckInDate, setInitialCheckInDate] = useState('')
  const [initialCheckOutDate, setInitialCheckOutDate] = useState('')
  const [initialOpenBookingModal, setInitialOpenBookingModal] = useState(false)

  const handleLogout = () => {
    setUserType(null)
    setUser(null)
    setCurrentPage('home')
  }

  const handleLogin = (type, userData) => {
    setUserType(type)
    setUser(userData)
    setCurrentPage(type === 'admin' ? 'dashboard' : 'guestportal')
  }

  useEffect(() => {
    if (userType && user) {
      window.localStorage.setItem('hotelrUserType', userType)
      window.localStorage.setItem('hotelrUser', JSON.stringify(user))
      window.localStorage.setItem('hotelrCurrentPage', currentPage)
    } else {
      window.localStorage.removeItem('hotelrUserType')
      window.localStorage.removeItem('hotelrUser')
      window.localStorage.removeItem('hotelrCurrentPage')
    }
  }, [userType, user, currentPage])

  const handleNavigate = (page, params = {}) => {
    if (page === 'roombooking') {
      setInitialRoomType(params.roomType || null)
      setInitialCheckInDate(params.checkIn || '')
      setInitialCheckOutDate(params.checkOut || '')
      setInitialOpenBookingModal(params.autoOpenBookingModal === true)
    } else {
      setInitialOpenBookingModal(false)
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
        return <Home onNavigate={handleNavigate} onLogin={handleLogin} />
      case 'dashboard':
        return <AdminDashboard onNavigate={handleNavigate} />
      case 'checkin':
        return <CheckIn onBack={handleBack} />
      case 'roombooking':
        return (
          <RoomBooking
            userType={userType}
            onBack={handleBack}
            initialRoomType={initialRoomType}
            initialCheckInDate={initialCheckInDate}
            initialCheckOutDate={initialCheckOutDate}
            initialOpenBookingModal={initialOpenBookingModal}
          />
        )
      case 'rooms':
        return <Rooms onBack={handleBack} />
      case 'housekeeping':
        return <Housekeeping onBack={handleBack} />
      case 'fooddrinks':
        return <FoodDrinks onBack={handleBack} />
      case 'checkout':
        return <CheckOut onBack={handleBack} />
      case 'cancelbooking':
        return <CancelBooking onBack={handleBack} />
      case 'guests':
        return <Guests onBack={handleBack} />
      case 'guestportal':
        return (
          <GuestPortal
            user={user}
            onNavigate={handleNavigate}
            onBack={() => setCurrentPage('home')}
            onLogout={handleLogout}
          />
        )
      case 'feedback':
        return <Feedback onBack={handleBack} />
      case 'reviews':
        return <Reviews onBack={handleBack} />
      case 'settings':
        return <Settings onBack={handleBack} />
      case 'digitalkeys':
        return <DigitalKeys onBack={handleBack} />
      default:
        return <Home onNavigate={handleNavigate} />
    }
  }

  if (userType === 'admin') {
    return (
      <AdminLayout user={user} onLogout={handleLogout} onNavigate={handleNavigate}>
        {renderPage()}
      </AdminLayout>
    )
  }

  return renderPage()
}

export default App
