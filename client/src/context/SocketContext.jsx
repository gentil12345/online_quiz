import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext.jsx'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      const newSocket = io('/', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      newSocket.on('connect', () => {
        setConnected(true)
        console.log('Socket connected:', newSocket.id)
      })

      newSocket.on('disconnect', () => {
        setConnected(false)
        console.log('Socket disconnected')
      })

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message)
        setConnected(false)
      })

      setSocket(newSocket)

      return () => {
        newSocket.disconnect()
        setSocket(null)
        setConnected(false)
      }
    } else {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
    }
  }, [user, token])

  const joinRoom = (roomId, userId, userName) => {
    if (socket) {
      socket.emit('join-room', { roomId, userId, userName })
    }
  }

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave-room', { roomId })
    }
  }

  const sendOffer = (offer, to, from, userName) => {
    if (socket) {
      socket.emit('offer', { offer, to, from, userName })
    }
  }

  const sendAnswer = (answer, to, from) => {
    if (socket) {
      socket.emit('answer', { answer, to, from })
    }
  }

  const sendIceCandidate = (candidate, to, from) => {
    if (socket) {
      socket.emit('ice-candidate', { candidate, to, from })
    }
  }

  const sendMediaState = (roomId, audioEnabled, videoEnabled) => {
    if (socket) {
      socket.emit('media-state', { roomId, audioEnabled, videoEnabled })
    }
  }

  const sendChatMessage = (roomId, message, userName, userId) => {
    if (socket) {
      socket.emit('chat-message', { roomId, message, userName, userId })
    }
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinRoom,
        leaveRoom,
        sendOffer,
        sendAnswer,
        sendIceCandidate,
        sendMediaState,
        sendChatMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}

export default SocketContext
