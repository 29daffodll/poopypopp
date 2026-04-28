import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function AdminLayout({ children, user, onLogout }) {
  return (
    <div className="admin-container">
      <Header />
      <div className="admin-content">
        <Sidebar user={user} onLogout={onLogout} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
