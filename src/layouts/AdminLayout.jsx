import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

export default function AdminLayout({ children, user, onLogout, onNavigate }) {
  return (
    <div className="admin-container">
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <div className="admin-content">
        <Sidebar user={user} onLogout={onLogout} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
