import { useState, useEffect, useRef, useCallback } from 'react'
import { useSocket } from '../context/SocketContext.jsx'

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

const useVideoCall = (roomId, userId, userName) => {
  const { socket, joinRoom, leaveRoom, sendOffer, sendAnswer, sendIceCandidate, sendMediaState } = useSocket()

  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState(new Map())
  const [participants, setParticipants] = useState([])
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [error, setError] = useState(null)

  const peerConnections = useRef(new Map())
  const localStreamRef = useRef(null)
  const screenStreamRef = useRef(null)

  // Get user media
  const getUserMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.error('Error accessing media devices:', err)
      setError('Failed to access camera/microphone. Please check permissions.')
      throw err
    }
  }, [])

  // Create peer connection
  const createPeerConnection = useCallback(
    (socketId) => {
      const pc = new RTCPeerConnection(ICE_SERVERS)

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current)
        })
      }

      // Handle remote stream
      pc.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const newMap = new Map(prev)
          newMap.set(socketId, event.streams[0])
          return newMap
        })
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendIceCandidate(event.candidate, socketId, socket.id)
        }
      }

      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${socketId}:`, pc.connectionState)
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev)
            newMap.delete(socketId)
            return newMap
          })
        }
      }

      peerConnections.current.set(socketId, pc)
      return pc
    },
    [socket, sendIceCandidate]
  )

  // Handle new user joined
  const handleUserJoined = useCallback(
    async ({ socketId, userName: newUserName }) => {
      console.log('User joined:', newUserName, socketId)
      const pc = createPeerConnection(socketId)

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        sendOffer(offer, socketId, socket.id, userName)
      } catch (err) {
        console.error('Error creating offer:', err)
      }
    },
    [createPeerConnection, sendOffer, socket, userName]
  )

  // Handle offer received
  const handleOffer = useCallback(
    async ({ offer, from, userName: senderName }) => {
      console.log('Received offer from:', senderName, from)
      const pc = createPeerConnection(from)

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendAnswer(answer, from, socket.id)
      } catch (err) {
        console.error('Error handling offer:', err)
      }
    },
    [createPeerConnection, sendAnswer, socket]
  )

  // Handle answer received
  const handleAnswer = useCallback(
    async ({ answer, from }) => {
      console.log('Received answer from:', from)
      const pc = peerConnections.current.get(from)
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (err) {
          console.error('Error handling answer:', err)
        }
      }
    },
    []
  )

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async ({ candidate, from }) => {
    const pc = peerConnections.current.get(from)
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    }
  }, [])

  // Handle user left
  const handleUserLeft = useCallback(({ socketId }) => {
    console.log('User left:', socketId)
    const pc = peerConnections.current.get(socketId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(socketId)
    }
    setRemoteStreams((prev) => {
      const newMap = new Map(prev)
      newMap.delete(socketId)
      return newMap
    })
  }, [])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setAudioEnabled(audioTrack.enabled)
        sendMediaState(roomId, audioTrack.enabled, videoEnabled)
      }
    }
  }, [roomId, videoEnabled, sendMediaState])

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setVideoEnabled(videoTrack.enabled)
        sendMediaState(roomId, audioEnabled, videoTrack.enabled)
      }
    }
  }, [roomId, audioEnabled, sendMediaState])

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!screenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        screenStreamRef.current = screenStream

        const screenTrack = screenStream.getVideoTracks()[0]
        screenTrack.onended = () => {
          toggleScreenShare()
        }

        // Replace video track in all peer connections
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
          if (sender) {
            sender.replaceTrack(screenTrack)
          }
        })

        setScreenSharing(true)
      } else {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop())
          screenStreamRef.current = null
        }

        // Restore camera track
        if (localStreamRef.current) {
          const cameraTrack = localStreamRef.current.getVideoTracks()[0]
          peerConnections.current.forEach((pc) => {
            const sender = pc.getSenders().find((s) => s.track?.kind === 'video')
            if (sender && cameraTrack) {
              sender.replaceTrack(cameraTrack)
            }
          })
        }

        setScreenSharing(false)
      }
    } catch (err) {
      console.error('Error toggling screen share:', err)
      setError('Failed to share screen')
    }
  }, [screenSharing])

  // Initialize
  useEffect(() => {
    if (!socket || !roomId || !userId || !userName) return

    const init = async () => {
      try {
        await getUserMedia()
        joinRoom(roomId, userId, userName)
      } catch (err) {
        console.error('Initialization error:', err)
      }
    }

    init()

    // Socket listeners
    socket.on('user-joined', handleUserJoined)
    socket.on('room-participants', ({ participants: existingParticipants }) => {
      existingParticipants.forEach((p) => handleUserJoined({ socketId: p.socketId, userName: p.userName }))
    })
    socket.on('offer', handleOffer)
    socket.on('answer', handleAnswer)
    socket.on('ice-candidate', handleIceCandidate)
    socket.on('user-left', handleUserLeft)

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      peerConnections.current.forEach((pc) => pc.close())
      peerConnections.current.clear()
      leaveRoom(roomId)

      socket.off('user-joined', handleUserJoined)
      socket.off('room-participants')
      socket.off('offer', handleOffer)
      socket.off('answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
      socket.off('user-left', handleUserLeft)
    }
  }, [socket, roomId, userId, userName])

  return {
    localStream,
    remoteStreams,
    participants,
    audioEnabled,
    videoEnabled,
    screenSharing,
    error,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  }
}

export default useVideoCall
