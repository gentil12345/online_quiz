import { useState, useEffect } from 'react'
import {
  FiBarChart2, FiDownload, FiPlus, FiCalendar,
  FiTrendingUp, FiUsers, FiDollarSign, FiActivity,
  FiTrash2, FiEye, FiRefreshCw,
} from 'react-icons/fi'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from 'recharts'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import { format } from 'date-fns'

const REPORT_TYPES = [
  { value: 'progress', label: 'Progress Report', icon: <FiTrendingUp size={16} />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { value: 'performance', label: 'Performance Report', icon: <FiActivity size={16} />, color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { value: 'enrollment', label: 'Enrollment Report', icon: <FiUsers size={16} />, color: 'bg-green-50 text-green-600 border-green-200' },
  { value: 'revenue', label: 'Revenue Report', icon: <FiDollarSign size={16} />, color: 'bg-orange-50 text-orange-600 border-orange-200' },
]

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

const ReportChart = ({ report }) => {
  if (!report?.data) return null
  const data = report.data

  switch (report.type) {
    case 'enrollment':
      return (
        <div className="space-y-6">
          {data.monthly && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Enrollments</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {data.byCategory && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Enrollments by Category</h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {data.byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )

    case 'progress':
      return (
        <div className="space-y-6">
          {data.weeklyProgress && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Weekly Progress</h4>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activeStudents" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Active Students" />
                  <Line type="monotone" dataKey="completions" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Completions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )

    case 'performance':
      return (
        <div className="space-y-6">
          {data.ratingDistribution && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Distribution</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="star" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Courses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )

    case 'revenue':
      return (
        <div className="space-y-6">
          {data.monthlyRevenue && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Monthly Revenue</h4>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`$${v}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [downloading, setDownloading] = useState(null)

  const [generateForm, setGenerateForm] = useState({
    type: 'enrollment',
    title: '',
    dateRange: {
      start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
    },
  })

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports')
      setReports(data.reports || [])
    } catch (err) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleGenerate = async () => {
    if (!generateForm.type) {
      toast.error('Please select a report type')
      return
    }
    setGenerating(true)
    try {
      const { data } = await api.post('/reports/generate', {
        type: generateForm.type,
        title: generateForm.title || undefined,
        dateRange: generateForm.dateRange,
      })
      toast.success('Report generated successfully!')
      setReports((prev) => [data.report, ...prev])
      setShowGenerateModal(false)
      setSelectedReport(data.report)
      setShowViewModal(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async (reportId, reportTitle) => {
    setDownloading(reportId)
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${reportTitle.replace(/\s+/g, '_')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Report downloaded!')
    } catch (err) {
      toast.error('Failed to download report')
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    try {
      await api.delete(`/reports/${reportId}`)
      setReports((prev) => prev.filter((r) => r._id !== reportId))
      toast.success('Report deleted')
    } catch (err) {
      toast.error('Failed to delete report')
    }
  }

  const getTypeConfig = (type) => REPORT_TYPES.find((t) => t.value === type) || REPORT_TYPES[0]

  const getSummaryStats = (report) => {
    const d = report.data || {}
    switch (report.type) {
      case 'enrollment': return [
        { label: 'Total Courses', value: d.totalCourses || 0 },
        { label: 'Total Enrollments', value: d.totalEnrollments || 0 },
      ]
      case 'progress': return [
        { label: 'Total Students', value: d.totalStudents || 0 },
        { label: 'Avg Completion', value: `${d.avgCompletionRate || 0}%` },
      ]
      case 'performance': return [
        { label: 'Total Courses', value: d.totalCourses || 0 },
        { label: 'Avg Rating', value: d.avgRating || '0.0' },
      ]
      case 'revenue': return [
        { label: 'Total Revenue', value: `$${d.totalRevenue || 0}` },
        { label: 'Paid Courses', value: d.totalPaidCourses || 0 },
      ]
      default: return []
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Generate and analyze platform reports</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <FiRefreshCw size={15} /> Refresh
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <FiPlus size={15} /> Generate Report
          </button>
        </div>
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {REPORT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setGenerateForm((p) => ({ ...p, type: type.value }))
              setShowGenerateModal(true)
            }}
            className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${type.color}`}
          >
            <div className="mb-2">{type.icon}</div>
            <p className="text-sm font-semibold">{type.label}</p>
          </button>
        ))}
      </div>

      {/* Reports table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Report History</h2>
          <span className="text-sm text-gray-500">{reports.length} reports</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading reports..." />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <FiBarChart2 className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 text-sm">No reports generated yet</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="text-primary-600 font-medium text-sm mt-2 hover:underline"
            >
              Generate your first report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Report</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date Range</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Generated</th>
                  <th className="text-right py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((report) => {
                  const typeConfig = getTypeConfig(report.type)
                  return (
                    <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-medium text-gray-900">{report.title}</p>
                        <p className="text-xs text-gray-500">by {report.generatedBy?.name}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
                          {typeConfig.icon}
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-600 text-xs">
                        {format(new Date(report.dateRange.start), 'MMM d, yyyy')} –{' '}
                        {format(new Date(report.dateRange.end), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">
                        {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setSelectedReport(report); setShowViewModal(true) }}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="View report"
                          >
                            <FiEye size={15} />
                          </button>
                          <button
                            onClick={() => handleDownload(report._id, report.title)}
                            disabled={downloading === report._id}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Download PDF"
                          >
                            {downloading === report._id ? (
                              <div className="w-3.5 h-3.5 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiDownload size={15} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete report"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Generate Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate New Report"
        size="md"
      >
        <div className="space-y-5">
          {/* Type selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setGenerateForm((p) => ({ ...p, type: type.value }))}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    generateForm.type === type.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Report Title <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={generateForm.title}
              onChange={(e) => setGenerateForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiCalendar size={14} /> Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={generateForm.dateRange.start}
                  onChange={(e) =>
                    setGenerateForm((p) => ({ ...p, dateRange: { ...p.dateRange, start: e.target.value } }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={generateForm.dateRange.end}
                  onChange={(e) =>
                    setGenerateForm((p) => ({ ...p, dateRange: { ...p.dateRange, end: e.target.value } }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowGenerateModal(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedReport?.title || 'Report Details'}
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-medium ${getTypeConfig(selectedReport.type).color}`}>
                {getTypeConfig(selectedReport.type).icon}
                {getTypeConfig(selectedReport.type).label}
              </span>
              <span className="text-gray-500">
                {format(new Date(selectedReport.dateRange.start), 'MMM d')} –{' '}
                {format(new Date(selectedReport.dateRange.end), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              {getSummaryStats(selectedReport).map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <ReportChart report={selectedReport} />

            {/* Download button */}
            <button
              onClick={() => handleDownload(selectedReport._id, selectedReport.title)}
              disabled={downloading === selectedReport._id}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {downloading === selectedReport._id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <FiDownload size={15} /> Download PDF
                </>
              )}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Reports
