import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import reportRoutes from './routes/reports.js';
import videoRoutes from './routes/video.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/video', videoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning_platform')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Socket.IO for WebRTC signaling
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Join a video room
  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const room = rooms.get(roomId);
    room.set(socket.id, { userId, userName, socketId: socket.id });

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      socketId: socket.id,
      userId,
      userName,
      participants: Array.from(room.values()),
    });

    // Send current participants to the new user
    socket.emit('room-participants', {
      participants: Array.from(room.values()).filter((p) => p.socketId !== socket.id),
    });

    console.log(`👤 ${userName} joined room ${roomId}`);
  });

  // WebRTC offer
  socket.on('offer', ({ offer, to, from, userName }) => {
    io.to(to).emit('offer', { offer, from, userName });
  });

  // WebRTC answer
  socket.on('answer', ({ answer, to, from }) => {
    io.to(to).emit('answer', { answer, from });
  });

  // ICE candidate
  socket.on('ice-candidate', ({ candidate, to, from }) => {
    io.to(to).emit('ice-candidate', { candidate, from });
  });

  // Leave room
  socket.on('leave-room', ({ roomId }) => {
    handleLeaveRoom(socket, roomId);
  });

  // Toggle media state (mute/camera)
  socket.on('media-state', ({ roomId, audioEnabled, videoEnabled }) => {
    socket.to(roomId).emit('peer-media-state', {
      socketId: socket.id,
      audioEnabled,
      videoEnabled,
    });
  });

  // Screen sharing
  socket.on('screen-share-started', ({ roomId }) => {
    socket.to(roomId).emit('peer-screen-share-started', { socketId: socket.id });
  });

  socket.on('screen-share-stopped', ({ roomId }) => {
    socket.to(roomId).emit('peer-screen-share-stopped', { socketId: socket.id });
  });

  // Chat message in room
  socket.on('chat-message', ({ roomId, message, userName, userId }) => {
    io.to(roomId).emit('chat-message', {
      message,
      userName,
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
    // Remove from all rooms
    rooms.forEach((room, roomId) => {
      if (room.has(socket.id)) {
        handleLeaveRoom(socket, roomId);
      }
    });
  });
});

function handleLeaveRoom(socket, roomId) {
  const room = rooms.get(roomId);
  if (room) {
    const participant = room.get(socket.id);
    room.delete(socket.id);

    if (room.size === 0) {
      rooms.delete(roomId);
    }

    socket.to(roomId).emit('user-left', {
      socketId: socket.id,
      participant,
      participants: Array.from(room.values()),
    });

    socket.leave(roomId);
    console.log(`👤 Socket ${socket.id} left room ${roomId}`);
  }
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
