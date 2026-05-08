import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor,
  FiPhoneOff, FiCopy, FiCheck, FiUsers, FiMessageSquare,
  FiSend, FiX,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import useVideoCall from '../hooks/useVideoCall.js'
import api from '../api/axios.js'
import toast from 'react-hot-toast'

const VideoTile = ({ stream, label, muted = false, isLocal = false }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
            <FiVideo className="text-gray-400" size={28} />
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
        {label} {isLocal && '(You)'}
      </div>
    </div>
  )
}

const VideoCall = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { socket, sendChatMessage } = useSocket()

  const [copied, setCopied] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [sessionInfo, setSessionInfo] = useState(null)
  const [joining, setJoining] = useState(true)
  const chatEndRef = useRef(null)

  const actualRoomId = roomId === 'new' ? null : roomId
  const [activeRoomId, setActiveRoomId] = useState(actualRoomId)

  const {
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    screenSharing,
    error,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  } = useVideoCall(activeRoomId, user?._id, user?.name)

  // Create or join room
  useEffect(() => {
    const initRoom = async () => {
      try {
        if (roomId === 'new') {
          const { data } = await api.post('/video/rooms', {
            title: `${user?.name}'s Session`,
          })
          setActiveRoomId(data.roomId)
          setSessionInfo(data.session)
          navigate(`/video-call/${data.roomId}`, { replace: true })
        } else {
          const { data } = await api.post(`/video/rooms/${roomId}/join`)
          setSessionInfo(data.session)
        }
      } catch (err) {
        toast.error('Failed to join room')
        navigate('/dashboard')
      } finally {
        setJoining(false)
      }
    }
    if (user) initRoom()
  }, [roomId, user])

  // Chat messages
  useEffect(() => {
    if (!socket) return
    const handleMessage = (msg) => {
      setChatMessages((prev) => [...prev, msg])
    }
    socket.on('chat-message', handleMessage)
    return () => socket.off('chat-message', handleMessage)
  }, [socket])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(activeRoomId || roomId)
    setCopied(true)
    toast.success('Room ID copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEndCall = async () => {
    try {
      if (activeRoomId) {
        await api.post(`/video/rooms/${activeRoomId}/leave`)
      }
    } catch (err) {
      console.error('Leave room error:', err)
    }
    navigate('/dashboard')
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !activeRoomId) return
    sendChatMessage(activeRoomId, chatInput.trim(), user?.name, user?._id)
    setChatInput('')
  }

  if (joining) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Setting up your session...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white max-w-md px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiVideoOff className="text-red-400" size={28} />
          </div>
          <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const remoteStreamArray = Array.from(remoteStreams.entries())

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-medium text-sm">
            {sessionInfo?.title || 'Video Session'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <span className="text-gray-400 text-xs">Room:</span>
            <span className="text-white text-xs font-mono font-semibold">{activeRoomId || roomId}</span>
            <button
              onClick={handleCopyRoomId}
              className="text-gray-400 hover:text-white transition-colors ml-1"
              aria-label="Copy room ID"
            >
              {copied ? <FiCheck size={14} className="text-green-400" /> : <FiCopy size={14} />}
            </button>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <FiUsers size={14} />
            <span>{remoteStreamArray.length + 1}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div
            className={`grid gap-3 h-full ${
              remoteStreamArray.length === 0
                ? 'grid-cols-1 max-w-2xl mx-auto'
                : remoteStreamArray.length === 1
                ? 'grid-cols-1 md:grid-cols-2'
                : remoteStreamArray.length <= 3
                ? 'grid-cols-2'
                : 'grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {/* Local video */}
            <VideoTile
              stream={localStream}
              label={user?.name || 'You'}
              muted
              isLocal
            />

            {/* Remote videos */}
            {remoteStreamArray.map(([socketId, stream]) => (
              <VideoTile
                key={socketId}
                stream={stream}
                label={`Participant`}
              />
            ))}
          </div>
        </div>

        {/* Chat panel */}
        {showChat && (
          <div className="w-72 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-medium text-sm">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500 text-xs text-center mt-4">No messages yet</p>
              ) : (
                chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`${msg.userId === user?._id ? 'items-end' : 'items-start'} flex flex-col`}
                  >
                    <span className="text-gray-500 text-xs mb-1">{msg.userName}</span>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                        msg.userId === user?._id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800 text-gray-200'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors"
                  aria-label="Send message"
                >
                  <FiSend size={14} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Mute */}
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? <FiMic size={18} /> : <FiMicOff size={18} />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              videoEnabled
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            title={videoEnabled ? 'Camera off' : 'Camera on'}
          >
            {videoEnabled ? <FiVideo size={18} /> : <FiVideoOff size={18} />}
          </button>

          {/* Screen share */}
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              screenSharing
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            aria-label={screenSharing ? 'Stop screen share' : 'Share screen'}
            title={screenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <FiMonitor size={18} />
          </button>

          {/* Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              showChat
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            aria-label="Toggle chat"
            title="Chat"
          >
            <FiMessageSquare size={18} />
          </button>

          {/* End call */}
          <button
            onClick={handleEndCall}
            className="w-14 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg"
            aria-label="End call"
            title="End call"
          >
            <FiPhoneOff size={20} />
          </button>
        </div>

        {/* Status indicators */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="text-xs text-gray-500">
            {audioEnabled ? '🎤 Mic on' : '🔇 Muted'}
          </span>
          <span className="text-xs text-gray-500">
            {videoEnabled ? '📹 Camera on' : '📷 Camera off'}
          </span>
          {screenSharing && (
            <span className="text-xs text-primary-400">🖥️ Sharing screen</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoCall
