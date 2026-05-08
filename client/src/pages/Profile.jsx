import { useState, useEffect, useRef } from 'react'
import {
  FiUser, FiMail, FiBriefcase, FiEdit2, FiSave, FiX,
  FiPlus, FiTrash2, FiLinkedin, FiGithub, FiTwitter,
  FiGlobe, FiCamera, FiBook, FiAward,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/axios.js'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx'

const Profile = () => {
  const { user, updateUser, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    bio: '',
    profession: '',
    skills: [],
    socialLinks: { linkedin: '', github: '', twitter: '', website: '' },
    education: [],
    experience: [],
  })

  const [newSkill, setNewSkill] = useState('')
  const [newEducation, setNewEducation] = useState({ institution: '', degree: '', field: '', startYear: '', endYear: '' })
  const [newExperience, setNewExperience] = useState({ company: '', position: '', description: '', current: false })
  const [showAddEdu, setShowAddEdu] = useState(false)
  const [showAddExp, setShowAddExp] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        profession: user.profession || '',
        skills: user.skills || [],
        socialLinks: {
          linkedin: user.socialLinks?.linkedin || '',
          github: user.socialLinks?.github || '',
          twitter: user.socialLinks?.twitter || '',
          website: user.socialLinks?.website || '',
        },
        education: user.education || [],
        experience: user.experience || [],
      })
    }
  }, [user])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('bio', form.bio)
      formData.append('profession', form.profession)
      formData.append('skills', JSON.stringify(form.skills))
      formData.append('socialLinks', JSON.stringify(form.socialLinks))
      formData.append('education', JSON.stringify(form.education))
      formData.append('experience', JSON.stringify(form.experience))
      if (avatarFile) formData.append('avatar', avatarFile)

      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      updateUser(data.user)
      setEditing(false)
      setAvatarFile(null)
      setAvatarPreview(null)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        profession: user.profession || '',
        skills: user.skills || [],
        socialLinks: user.socialLinks || { linkedin: '', github: '', twitter: '', website: '' },
        education: user.education || [],
        experience: user.experience || [],
      })
    }
  }

  const addSkill = () => {
    const skill = newSkill.trim()
    if (!skill) return
    if (form.skills.includes(skill)) {
      toast.error('Skill already added')
      return
    }
    setForm((prev) => ({ ...prev, skills: [...prev.skills, skill] }))
    setNewSkill('')
  }

  const removeSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))
  }

  const addEducation = () => {
    if (!newEducation.institution || !newEducation.degree) {
      toast.error('Institution and degree are required')
      return
    }
    setForm((prev) => ({ ...prev, education: [...prev.education, { ...newEducation, _id: Date.now() }] }))
    setNewEducation({ institution: '', degree: '', field: '', startYear: '', endYear: '' })
    setShowAddEdu(false)
  }

  const removeEducation = (id) => {
    setForm((prev) => ({ ...prev, education: prev.education.filter((e) => e._id !== id) }))
  }

  const addExperience = () => {
    if (!newExperience.company || !newExperience.position) {
      toast.error('Company and position are required')
      return
    }
    setForm((prev) => ({ ...prev, experience: [...prev.experience, { ...newExperience, _id: Date.now() }] }))
    setNewExperience({ company: '', position: '', description: '', current: false })
    setShowAddExp(false)
  }

  const removeExperience = (id) => {
    setForm((prev) => ({ ...prev, experience: prev.experience.filter((e) => e._id !== id) }))
  }

  const avatarSrc = avatarPreview || user?.avatar || null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your professional information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            <FiEdit2 size={15} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <FiX size={15} /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave size={15} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Avatar & Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold">{user?.name?.charAt(0)}</span>
                )}
              </div>
              {editing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    aria-label="Change avatar"
                  >
                    <FiCamera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              {editing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Profession</label>
                    <input
                      type="text"
                      value={form.profession}
                      onChange={(e) => setForm((p) => ({ ...p, profession: e.target.value }))}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bio</label>
                    <textarea
                      value={form.bio}
                      onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                  {user?.profession && (
                    <p className="text-primary-600 font-medium mt-0.5">{user.profession}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                    <FiMail size={13} />
                    {user?.email}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                    <FiUser size={13} />
                    <span className="capitalize">{user?.role}</span>
                  </div>
                  {user?.bio && <p className="text-gray-600 text-sm mt-2">{user.bio}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiAward className="text-primary-500" size={18} /> Skills
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full font-medium"
              >
                {skill}
                {editing && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-primary-400 hover:text-primary-700 transition-colors"
                    aria-label={`Remove ${skill}`}
                  >
                    <FiX size={12} />
                  </button>
                )}
              </span>
            ))}
            {form.skills.length === 0 && !editing && (
              <p className="text-gray-400 text-sm">No skills added yet</p>
            )}
          </div>
          {editing && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={addSkill}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <FiPlus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiGlobe className="text-primary-500" size={18} /> Social Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'linkedin', icon: <FiLinkedin size={16} />, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/...' },
              { key: 'github', icon: <FiGithub size={16} />, label: 'GitHub', placeholder: 'https://github.com/...' },
              { key: 'twitter', icon: <FiTwitter size={16} />, label: 'Twitter', placeholder: 'https://twitter.com/...' },
              { key: 'website', icon: <FiGlobe size={16} />, label: 'Website', placeholder: 'https://yourwebsite.com' },
            ].map(({ key, icon, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                  {icon} {label}
                </label>
                {editing ? (
                  <input
                    type="url"
                    value={form.socialLinks[key]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: e.target.value } }))
                    }
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <div className="text-sm text-gray-600">
                    {form.socialLinks[key] ? (
                      <a
                        href={form.socialLinks[key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline truncate block"
                      >
                        {form.socialLinks[key]}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiBook className="text-primary-500" size={18} /> Education
            </h3>
            {editing && (
              <button
                onClick={() => setShowAddEdu(!showAddEdu)}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <FiPlus size={15} /> Add
              </button>
            )}
          </div>

          {showAddEdu && editing && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation((p) => ({ ...p, institution: e.target.value }))}
                  placeholder="Institution *"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation((p) => ({ ...p, degree: e.target.value }))}
                  placeholder="Degree *"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation((p) => ({ ...p, field: e.target.value }))}
                  placeholder="Field of Study"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newEducation.startYear}
                    onChange={(e) => setNewEducation((p) => ({ ...p, startYear: e.target.value }))}
                    placeholder="Start Year"
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    value={newEducation.endYear}
                    onChange={(e) => setNewEducation((p) => ({ ...p, endYear: e.target.value }))}
                    placeholder="End Year"
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addEducation} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                  Add Education
                </button>
                <button onClick={() => setShowAddEdu(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {form.education.length === 0 ? (
            <p className="text-gray-400 text-sm">No education added yet</p>
          ) : (
            <div className="space-y-3">
              {form.education.map((edu) => (
                <div key={edu._id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{edu.degree}</p>
                    <p className="text-gray-600 text-sm">{edu.institution}</p>
                    {edu.field && <p className="text-gray-500 text-xs">{edu.field}</p>}
                    {(edu.startYear || edu.endYear) && (
                      <p className="text-gray-400 text-xs">{edu.startYear} - {edu.endYear || 'Present'}</p>
                    )}
                  </div>
                  {editing && (
                    <button onClick={() => removeEducation(edu._id)} className="text-red-400 hover:text-red-600 transition-colors ml-2">
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiBriefcase className="text-primary-500" size={18} /> Experience
            </h3>
            {editing && (
              <button
                onClick={() => setShowAddExp(!showAddExp)}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <FiPlus size={15} /> Add
              </button>
            )}
          </div>

          {showAddExp && editing && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience((p) => ({ ...p, company: e.target.value }))}
                  placeholder="Company *"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  value={newExperience.position}
                  onChange={(e) => setNewExperience((p) => ({ ...p, position: e.target.value }))}
                  placeholder="Position *"
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description"
                  rows={2}
                  className="sm:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={addExperience} className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                  Add Experience
                </button>
                <button onClick={() => setShowAddExp(false)} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {form.experience.length === 0 ? (
            <p className="text-gray-400 text-sm">No experience added yet</p>
          ) : (
            <div className="space-y-3">
              {form.experience.map((exp) => (
                <div key={exp._id} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{exp.position}</p>
                    <p className="text-gray-600 text-sm">{exp.company}</p>
                    {exp.description && <p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
                    {exp.current && <span className="text-xs text-green-600 font-medium">Current</span>}
                  </div>
                  {editing && (
                    <button onClick={() => removeExperience(exp._id)} className="text-red-400 hover:text-red-600 transition-colors ml-2">
                      <FiTrash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
