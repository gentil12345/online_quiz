import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiBook, FiAward, FiClock, FiTrendingUp, FiVideo,
  FiBarChart2, FiUser, FiArrowRight, FiPlus,
} from 'react-icons/fi'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import Card from '../components/ui/Card.jsx'

const StatCard = ({ icon, label, value, change, color, to }) => (
  <Link to={to || '#'} className="block">
    <div className={`bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </Link>
)

const progressData = [
  { week: 'Week 1', hours: 4, completed: 1 },
  { week: 'Week 2', hours: 6, completed: 2 },
  { week: 'Week 3', hours: 3, completed: 1 },
  { week: 'Week 4', hours: 8, completed: 3 },
  { week: 'Week 5', hours: 5, completed: 2 },
  { week: 'Week 6', hours: 10, completed: 4 },
  { week: 'Week 7', hours: 7, completed: 3 },
  { week: 'Week 8', hours: 12, completed: 5 },
]

const activityData = [
  { day: 'Mon', sessions: 2 },
  { day: 'Tue', sessions: 4 },
  { day: 'Wed', sessions: 1 },
  { day: 'Thu', sessions: 5 },
  { day: 'Fri', sessions: 3 },
  { day: 'Sat', sessions: 6 },
  { day: 'Sun', sessions: 2 },
]

const Dashboard = () => {
  const { user, isTeacher, isAdmin } = useAuth()
  const [stats, setStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.get('/users/stats'),
          api.get('/courses?limit=4'),
        ])
        setStats(statsRes.data.stats)
        setCourses(coursesRes.data.courses || [])
      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard..." />

  const statCards = [
    {
      icon: <FiBook className="text-blue-600" size={18} />,
      label: 'Enrolled Courses',
      value: stats?.enrolledCourses ?? 0,
      change: 12,
      color: 'bg-blue-50',
      to: '/courses',
    },
    {
      icon: <FiAward className="text-green-600" size={18} />,
      label: 'Completed',
      value: stats?.completedCourses ?? 0,
      change: 8,
      color: 'bg-green-50',
    },
    {
      icon: <FiClock className="text-purple-600" size={18} />,
      label: 'Hours Watched',
      value: `${stats?.hoursWatched ?? 0}h`,
      change: 15,
      color: 'bg-purple-50',
    },
    {
      icon: <FiTrendingUp className="text-orange-600" size={18} />,
      label: 'Progress Rate',
      value: `${stats?.progressRate ?? 0}%`,
      change: 5,
      color: 'bg-orange-50',
    },
  ]

  const quickActions = [
    { label: 'Browse Courses', icon: <FiBook size={16} />, to: '/courses', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Start Video Call', icon: <FiVideo size={16} />, to: '/video-call/new', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'My Profile', icon: <FiUser size={16} />, to: '/profile', color: 'bg-green-600 hover:bg-green-700' },
    ...(isTeacher ? [{ label: 'View Reports', icon: <FiBarChart2 size={16} />, to: '/reports', color: 'bg-orange-600 hover:bg-orange-700' }] : []),
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-primary-600">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your learning today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Learning Progress</h2>
                <p className="text-sm text-gray-500">Hours studied & courses completed per week</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressData} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="hours" name="Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Activity */}
        <div>
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
              <p className="text-sm text-gray-500">Sessions this week</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-white text-sm font-medium transition-colors ${action.color}`}
                >
                  {action.icon}
                  {action.label}
                  <FiArrowRight size={14} className="ml-auto" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Courses */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Available Courses</h2>
              <Link to="/courses" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                View all <FiArrowRight size={14} />
              </Link>
            </div>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <FiBook className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 text-sm">No courses available yet</p>
                <Link to="/courses" className="text-primary-600 text-sm font-medium mt-2 inline-block">
                  Browse courses
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <Link
                    key={course._id}
                    to={`/courses/${course._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <FiBook className="text-primary-500" size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-500">{course.category} · {course.level}</p>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {course.enrolledStudents?.length || 0} students
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
