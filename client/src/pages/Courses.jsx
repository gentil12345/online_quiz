import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch, FiFilter, FiBook, FiStar, FiUsers,
  FiClock, FiX, FiChevronDown,
} from 'react-icons/fi'
import api from '../api/axios.js'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

const CATEGORIES = [
  'All', 'Web Development', 'Mobile Development', 'Data Science',
  'Machine Learning', 'DevOps', 'Design', 'Business', 'Marketing', 'Other',
]
const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced']

const CourseCard = ({ course }) => (
  <Link
    to={`/courses/${course._id}`}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group"
  >
    <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 relative overflow-hidden">
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FiBook className="text-primary-300" size={40} />
        </div>
      )}
      <div className="absolute top-2 left-2">
        <span className="bg-white/90 backdrop-blur-sm text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {course.level}
        </span>
      </div>
      {course.isFree && (
        <div className="absolute top-2 right-2">
          <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Free
          </span>
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {course.category}
        </span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {course.title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>
      <div className="flex items-center gap-2 mb-3">
        {course.instructor?.avatar ? (
          <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-semibold">
            {course.instructor?.name?.charAt(0)}
          </div>
        )}
        <span className="text-xs text-gray-600 font-medium">{course.instructor?.name}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <FiStar className="text-yellow-400" size={12} />
            {course.rating?.toFixed(1) || '0.0'}
          </span>
          <span className="flex items-center gap-1">
            <FiUsers size={12} />
            {course.enrolledStudents?.length || 0}
          </span>
          {course.duration > 0 && (
            <span className="flex items-center gap-1">
              <FiClock size={12} />
              {course.duration}m
            </span>
          )}
        </div>
        <span className="font-semibold text-gray-900">
          {course.isFree ? 'Free' : `$${course.price}`}
        </span>
      </div>
    </div>
  </Link>
)

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [sort, setSort] = useState('-createdAt')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: 12,
        sort,
        ...(search && { search }),
        ...(category !== 'All' && { category }),
        ...(level !== 'All' && { level }),
      })
      const { data } = await api.get(`/courses?${params}`)
      setCourses(data.courses || [])
      setPagination(data.pagination)
    } catch (err) {
      console.error('Fetch courses error:', err)
    } finally {
      setLoading(false)
    }
  }, [search, category, level, sort, page])

  useEffect(() => {
    const timer = setTimeout(fetchCourses, 300)
    return () => clearTimeout(timer)
  }, [fetchCourses])

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setLevel('All')
    setSort('-createdAt')
    setPage(1)
  }

  const hasFilters = search || category !== 'All' || level !== 'All'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
        <p className="text-gray-600">Discover courses taught by expert instructors</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Level */}
          <div className="relative">
            <select
              value={level}
              onChange={(e) => { setLevel(e.target.value); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 cursor-pointer"
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 cursor-pointer"
            >
              <option value="-createdAt">Newest</option>
              <option value="-rating">Top Rated</option>
              <option value="-enrolledStudents">Most Popular</option>
              <option value="price">Price: Low to High</option>
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <FiX size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {pagination && (
        <p className="text-sm text-gray-500 mb-4">
          Showing {courses.length} of {pagination.total} courses
        </p>
      )}

      {/* Course grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" text="Loading courses..." />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <FiBook className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses found</h3>
          <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
          <button onClick={clearFilters} className="text-primary-600 font-medium text-sm hover:underline">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Courses
