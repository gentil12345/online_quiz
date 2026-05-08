import { v4 as uuidv4 } from 'uuid';
import VideoSession from '../models/VideoSession.js';
import User from '../models/User.js';
import { sendVideoSessionInvite } from '../utils/email.js';

// @desc    Create video room
// @route   POST /api/video/rooms
// @access  Private
export const createRoom = async (req, res) => {
  try {
    const { title, description, courseId, inviteEmails } = req.body;

    const roomId = uuidv4().substring(0, 8).toUpperCase();

    const session = await VideoSession.create({
      roomId,
      host: req.user._id,
      title: title || `${req.user.name}'s Session`,
      description: description || '',
      course: courseId || undefined,
      status: 'waiting',
    });

    await session.populate('host', 'name email avatar');

    // Send invites if emails provided
    if (inviteEmails && Array.isArray(inviteEmails) && inviteEmails.length > 0) {
      const invitePromises = inviteEmails.map(async (email) => {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          return sendVideoSessionInvite(user, session, req.user.name);
        }
      });
      await Promise.allSettled(invitePromises);
    }

    res.status(201).json({
      message: 'Room created successfully',
      session,
      roomId,
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all rooms
// @route   GET /api/video/rooms
// @access  Private
export const getRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.user.role !== 'admin') {
      query.$or = [
        { host: req.user._id },
        { 'participants.user': req.user._id },
      ];
    }

    const [sessions, total] = await Promise.all([
      VideoSession.find(query)
        .populate('host', 'name email avatar')
        .populate('course', 'title thumbnail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      VideoSession.countDocuments(query),
    ]);

    res.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get room by roomId
// @route   GET /api/video/rooms/:roomId
// @access  Private
export const getRoomById = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ roomId: req.params.roomId })
      .populate('host', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('course', 'title thumbnail');

    if (!session) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Join room
// @route   POST /api/video/rooms/:roomId/join
// @access  Private
export const joinRoom = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ roomId: req.params.roomId });

    if (!session) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (session.status === 'ended') {
      return res.status(400).json({ message: 'This session has ended' });
    }

    // Check if already a participant
    const alreadyJoined = session.participants.some(
      (p) => p.user?.toString() === req.user._id.toString() && !p.leftAt
    );

    if (!alreadyJoined) {
      session.participants.push({
        user: req.user._id,
        joinedAt: new Date(),
      });
    }

    if (session.status === 'waiting') {
      session.status = 'active';
    }

    await session.save();
    await session.populate('host', 'name email avatar');
    await session.populate('participants.user', 'name email avatar');

    res.json({
      message: 'Joined room successfully',
      session,
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    End session
// @route   POST /api/video/rooms/:roomId/end
// @access  Private
export const endSession = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ roomId: req.params.roomId });

    if (!session) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Only host or admin can end session
    if (
      session.host.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Only the host can end the session' });
    }

    session.status = 'ended';
    session.endTime = new Date();

    // Mark all participants as left
    session.participants.forEach((p) => {
      if (!p.leftAt) {
        p.leftAt = new Date();
      }
    });

    await session.save();

    res.json({
      message: 'Session ended successfully',
      session,
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Leave room
// @route   POST /api/video/rooms/:roomId/leave
// @access  Private
export const leaveRoom = async (req, res) => {
  try {
    const session = await VideoSession.findOne({ roomId: req.params.roomId });

    if (!session) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const participant = session.participants.find(
      (p) => p.user?.toString() === req.user._id.toString() && !p.leftAt
    );

    if (participant) {
      participant.leftAt = new Date();
      await session.save();
    }

    res.json({ message: 'Left room successfully' });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
