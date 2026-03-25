import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { FaUserCircle } from 'react-icons/fa'
import { LogOut } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar bg-base-300 px-4 min-h-16 sticky top-0 z-50">
      <div className="flex-1 font-bold text-2xl text-accent">
        Cashier Dashboard
      </div>

      {user && (
        <div className="flex items-center gap-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-accent"
              />
            ) : (
              <FaUserCircle className="w-8 h-8 text-accent" />
            )}
            <span className="text-sm font-semibold text-base-content hidden sm:block truncate max-w-32">
              {user.name}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm gap-1.5 text-base-content/70 hover:text-error"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline text-xs">Logout</span>
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar