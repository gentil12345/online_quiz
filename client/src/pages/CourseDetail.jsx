import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FiBook, FiStar, FiUsers, FiClock, FiPlay, FiCheck,
  FiArrowLeft, FiUser, FiGlobe, FiBarChart2,
} from 'react-icons/fi'
import api from '../api/axios.js'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import toast from 'react-hot-toast'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`)
        setCourse(data.course)
      } catch (err) {
        toast.error('Course not found')
        navigate('/courses')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  const isEnrolled = user && course?.enrolledStudents?.some(
    (s) => s._id === user._id || s === user._id
  )

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setEnrolling(true)
    try {
      await api.post(`/courses/${id}/enroll`)
      toast.success('Successfully enrolled!')
      const { data } = await api.get(`/courses/${id}`)
      setCourse(data.course)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <LoadingSpinner fullScreen text="Loading course..." />
  if (!course) return null

  const tabs = ['overview', 'curriculum', 'instructor', 'reviews']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Hero */}
          <div className="bg-gradient-to-br from-primary-900 to-secondary-800 rounded-2xl overflow-hidden mb-6">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
            ) : (
              <div className="aspect-video flex items-center justify-center">
                <FiBook className="text-white/30" size={64} />
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full">
              {course.category}
            </span>
            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
              {course.level}
            </span>
            {course.isFree && (
              <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                Free
              </span>
            )}
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1.5">
              <FiStar className="text-yellow-400" size={15} />
              <strong>{course.rating?.toFixed(1) || '0.0'}</strong>
              <span className="text-gray-400">({course.reviews?.length || 0} reviews)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FiUsers size={15} />
              {course.enrolledStudents?.length || 0} students
            </span>
            {course.duration > 0 && (
              <span className="flex items-center gap-1.5">
                <FiClock size={15} />
                {course.duration} minutes
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <FiGlobe size={15} />
              {course.language || 'English'}
            </span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {course.whatYouLearn?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {course.whatYouLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={15} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {course.requirements?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-1.5">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 mt-0.5">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Course Content ({course.videos?.length || 0} lessons)
              </h3>
              {course.videos?.length === 0 ? (
                <p className="text-gray-500 text-sm">No lessons added yet.</p>
              ) : (
                <div className="space-y-2">
                  {course.videos?.map((video, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiPlay className="text-primary-600" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                        {video.description && (
                          <p className="text-xs text-gray-500 truncate">{video.description}</p>
                        )}
                      </div>
                      {video.duration > 0 && (
                        <span className="text-xs text-gray-500 flex-shrink-0">{video.duration}m</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'instructor' && (
            <div>
              {course.instructor && (
                <div className="flex items-start gap-4">
                  {course.instructor.avatar ? (
                    <img
                      src={course.instructor.avatar}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xl font-bold">
                      {course.instructor.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.instructor.name}</h3>
                    <p className="text-primary-600 text-sm mb-2">{course.instructor.profession}</p>
                    <p className="text-gray-600 text-sm">{course.instructor.bio}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{course.rating?.toFixed(1) || '0.0'}</div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FiStar
                        key={s}
                        size={16}
                        className={s <= Math.round(course.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{course.reviews?.length || 0} reviews</p>
                </div>
              </div>
              {course.reviews?.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {course.reviews?.map((review, i) => (
                    <div key={i} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-semibold">
                          {review.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{review.user?.name}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FiStar
                                key={s}
                                size={12}
                                className={s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {course.isFree ? 'Free' : `$${course.price}`}
            </div>
            {!course.isFree && (
              <p className="text-sm text-gray-500 mb-4">One-time payment</p>
            )}

            {isEnrolled ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl">
                  <FiCheck size={16} />
                  <span className="text-sm font-medium">You're enrolled!</span>
                </div>
                <Link
                  to="/dashboard"
                  className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  course.isFree ? 'Enroll for Free' : `Enroll for $${course.price}`
                )}
              </button>
            )}

            <div className="mt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FiBarChart2 size={15} className="text-gray-400" />
                <span>{course.level} level</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPlay size={15} className="text-gray-400" />
                <span>{course.videos?.length || 0} lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock size={15} className="text-gray-400" />
                <span>{course.duration || 0} minutes total</span>
              </div>
              <div className="flex items-center gap-2">
                <FiGlobe size={15} className="text-gray-400" />
                <span>{course.language || 'English'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUsers size={15} className="text-gray-400" />
                <span>{course.enrolledStudents?.length || 0} students enrolled</span>
              </div>
            </div>

            {course.tags?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
