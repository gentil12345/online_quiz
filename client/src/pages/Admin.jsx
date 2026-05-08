import { useState, useEffect } from 'react'
import {
  FiUsers, FiBook, FiShield, FiSearch, FiTrash2,
  FiEdit2, FiCheck, FiX, FiRefreshCw, FiBarChart2,
  FiUser, FiMail, FiCalendar,
} from 'react-icons/fi'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import { format } from 'date-fns'

const ROLE_COLORS = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  teacher: 'bg-purple-50 text-purple-700 border-purple-200',
  student: 'bg-blue-50 text-blue-700 border-blue-200',
}

const Admin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({ total: 0, students: 0, teachers: 0, admins: 0 })
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('users')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      })
      const { data } = await api.get(`/users?${params}`)
      setUsers(data.users || [])
      setPagination(data.pagination)

      // Calculate stats
      if (!search && !roleFilter) {
        const allData = await api.get('/users?limit=1000')
        const allUsers = allData.data.users || []
        setStats({
          total: allUsers.length,
          students: allUsers.filter((u) => u.role === 'student').length,
          teachers: allUsers.filter((u) => u.role === 'teacher').length,
          admins: allUsers.filter((u) => u.role === 'admin').length,
        })
      }
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    setCoursesLoading(true)
    try {
      const { data } = await api.get('/courses?limit=50')
      setCourses(data.courses || [])
    } catch (err) {
      toast.error('Failed to load courses')
    } finally {
      setCoursesLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter])

  useEffect(() => {
    if (activeTab === 'courses') fetchCourses()
  }, [activeTab])

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return
    try {
      await api.delete(`/users/${userId}`)
      setUsers((prev) => prev.filter((u) => u._id !== userId))
      toast.success('User deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const statCards = [
    { label: 'Total Users', value: stats.total, icon: <FiUsers size={18} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Students', value: stats.students, icon: <FiUser size={18} />, color: 'bg-green-50 text-green-600' },
    { label: 'Teachers', value: stats.teachers, icon: <FiBook size={18} />, color: 'bg-purple-50 text-purple-600' },
    { label: 'Admins', value: stats.admins, icon: <FiShield size={18} />, color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiShield className="text-primary-600" size={24} />
          Admin Panel
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage users, courses, and platform settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-1">
          {[
            { id: 'users', label: 'Users', icon: <FiUsers size={15} /> },
            { id: 'courses', label: 'Courses', icon: <FiBook size={15} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <Card>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner text="Loading users..." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-semibold">
                                {user.name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${ROLE_COLORS[user.role] || ROLE_COLORS.student}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-500 text-xs">
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.isVerified ? 'text-green-600' : 'text-gray-400'}`}>
                            {user.isVerified ? <FiCheck size={12} /> : <FiX size={12} />}
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View user"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Showing {users.length} of {pagination.total} users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-sm text-gray-600">
                      {page} / {pagination.pages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                      disabled={page === pagination.pages}
                      className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {activeTab === 'courses' && (
        <Card>
          {coursesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner text="Loading courses..." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Instructor</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Students</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-900 truncate max-w-xs">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.level}</p>
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-xs">
                        {course.instructor?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-xs">
                        {course.enrolledStudents?.length || 0}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${course.isPublished ? 'text-green-600' : 'text-gray-400'}`}>
                          {course.isPublished ? <FiCheck size={12} /> : <FiX size={12} />}
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {courses.length === 0 && (
                <div className="text-center py-12">
                  <FiBook className="mx-auto text-gray-300 mb-3" size={40} />
                  <p className="text-gray-500 text-sm">No courses found</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {selectedUser.avatar ? (
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${ROLE_COLORS[selectedUser.role]}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FiMail size={14} className="text-gray-400" />
                {selectedUser.email}
              </div>
              {selectedUser.profession && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiUser size={14} className="text-gray-400" />
                  {selectedUser.profession}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <FiCalendar size={14} className="text-gray-400" />
                Joined {format(new Date(selectedUser.createdAt), 'MMMM d, yyyy')}
              </div>
              {selectedUser.bio && (
                <p className="text-gray-600 bg-gray-50 rounded-xl p-3">{selectedUser.bio}</p>
              )}
            </div>

            {selectedUser.skills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUser.skills.map((skill) => (
                    <span key={skill} className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{selectedUser.enrolledCourses?.length || 0}</div>
                <div className="text-xs text-gray-500">Enrolled Courses</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-gray-900">{selectedUser.hoursWatched || 0}h</div>
                <div className="text-xs text-gray-500">Hours Watched</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Admin
