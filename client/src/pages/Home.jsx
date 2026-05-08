import { Link } from 'react-router-dom'
import {
  FiVideo, FiBarChart2, FiUser, FiBook, FiArrowRight,
  FiCheck, FiStar, FiUsers, FiAward, FiPlay,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/ui/Logo.jsx'

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
  </div>
)

const Home = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: <FiVideo className="text-blue-600" size={22} />,
      title: 'Live Video Learning',
      description: 'Connect with instructors in real-time through WebRTC-powered video sessions with screen sharing and chat.',
      color: 'bg-blue-50',
    },
    {
      icon: <FiBarChart2 className="text-purple-600" size={22} />,
      title: 'Advanced Reports',
      description: 'Generate detailed progress, performance, enrollment, and revenue reports. Export to PDF with interactive charts.',
      color: 'bg-purple-50',
    },
    {
      icon: <FiUser className="text-green-600" size={22} />,
      title: 'Professional Profiles',
      description: 'Build a comprehensive profile with skills, experience, education, and social links to showcase your expertise.',
      color: 'bg-green-50',
    },
    {
      icon: <FiBook className="text-orange-600" size={22} />,
      title: 'Rich Course Library',
      description: 'Access courses across multiple categories. Learn at your own pace with structured video content.',
      color: 'bg-orange-50',
    },
    {
      icon: <FiAward className="text-red-600" size={22} />,
      title: 'Certificates',
      description: 'Earn certificates upon course completion and showcase your achievements on your professional profile.',
      color: 'bg-red-50',
    },
    {
      icon: <FiUsers className="text-teal-600" size={22} />,
      title: 'Community Learning',
      description: 'Join a vibrant community of learners. Collaborate and grow together with students and teachers worldwide.',
      color: 'bg-teal-50',
    },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      text: 'LearnPro transformed my career. The video sessions are incredibly interactive and the progress tracking keeps me motivated.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist',
      text: 'The professional profile feature helped me land my dream job. The courses are top-notch and the community is very supportive.',
      rating: 5,
    },
    {
      name: 'Amara Diallo',
      role: 'UX Designer',
      text: 'I love how easy it is to track my progress and generate reports. The platform is intuitive and the content quality is excellent.',
      rating: 5,
    },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-700 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Logo size="xl" white />
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <FiStar className="text-yellow-400" size={14} />
              <span>Trusted by 50,000+ learners worldwide</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Learn Without{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Limits
              </span>
            </h1>
            <p className="text-lg text-primary-100 mb-8 leading-relaxed max-w-xl mx-auto">
              Master new skills with live video sessions, expert instructors, and a community that supports your growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                >
                  Go to Dashboard <FiArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                  >
                    Start Learning Free <FiArrowRight size={18} />
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <FiPlay size={16} /> Browse Courses
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-8">
              {['Free to start', 'No credit card', 'Cancel anytime'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm text-primary-200">
                  <FiCheck size={14} className="text-green-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-primary-700 to-secondary-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50K+', label: 'Active Students', icon: <FiUsers size={24} /> },
              { value: '1,200+', label: 'Courses Available', icon: <FiBook size={24} /> },
              { value: '300+', label: 'Expert Instructors', icon: <FiUser size={24} /> },
              { value: '95%', label: 'Satisfaction Rate', icon: <FiStar size={24} /> },
            ].map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="flex justify-center mb-2 text-primary-200">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-primary-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools and resources you need to learn effectively and advance your career.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Learners Say</h2>
            <p className="text-gray-600">Join thousands of satisfied students who transformed their careers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <FiStar key={i} className="text-yellow-400 fill-yellow-400" size={16} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join over 50,000 learners who are already advancing their careers with LearnPro.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
              >
                Create Free Account <FiArrowRight size={18} />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                Explore Courses
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
