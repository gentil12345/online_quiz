import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiBook,
  FiVideo,
  FiBarChart2,
  FiUser,
  FiShield,
  FiSettings,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext.jsx'

const Sidebar = ({ collapsed = false }) => {
  const { user, isAdmin, isTeacher } = useAuth()

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
    { to: '/courses', label: 'Courses', icon: <FiBook size={20} /> },
    { to: '/video-call/new', label: 'Video Call', icon: <FiVideo size={20} /> },
    { to: '/profile', label: 'Profile', icon: <FiUser size={20} /> },
    ...(isTeacher ? [{ to: '/reports', label: 'Reports', icon: <FiBarChart2 size={20} /> }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: <FiShield size={20} /> }] : []),
  ]

  return (
    <aside
      className={`
        bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* User info */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-primary-50 text-primary-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
              ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-gray-100">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
            ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
            ${collapsed ? 'justify-center' : ''}`
          }
          title={collapsed ? 'Settings' : undefined}
        >
          <FiSettings size={20} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
