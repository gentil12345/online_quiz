# Learning Platform

A full-stack learning platform with video calling, professional profiles, and report generation.

## Tech Stack

**Frontend:** React 18 + Vite 4 + TailwindCSS + React Icons + Recharts + Socket.IO Client  
**Backend:** Node.js + Express + MongoDB + Mongoose + Socket.IO + Nodemailer + PDFKit

## Features

- 🎥 **Live Video Learning** — WebRTC-powered video sessions with screen sharing and chat
- 📊 **Advanced Reports** — Progress, performance, enrollment, and revenue reports with PDF export
- 👤 **Professional Profiles** — Skills, education, experience, and social links
- 📚 **Course Management** — Create, browse, enroll, and review courses
- 🔐 **Authentication** — JWT-based auth with email notifications
- 📧 **Email Notifications** — Welcome, enrollment, and password reset emails via Gmail

## Project Structure

```
learning-platform/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Navbar, Sidebar, Footer
│   │   │   └── ui/         # Button, Card, Modal, LoadingSpinner
│   │   ├── context/        # AuthContext, SocketContext
│   │   ├── hooks/          # useVideoCall (WebRTC)
│   │   └── pages/          # Home, Login, Register, Dashboard, Profile,
│   │                       # Courses, CourseDetail, VideoCall, Reports, Admin
│   └── package.json
│
├── server/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/    # authController, userController, courseController,
│   │   │                   # reportController, videoController
│   │   ├── middleware/     # auth.js (JWT)
│   │   ├── models/         # User, Course, Report, VideoSession
│   │   ├── routes/         # auth, users, courses, reports, video
│   │   └── utils/          # email.js (Nodemailer)
│   ├── uploads/            # Avatar and thumbnail uploads
│   ├── .env                # Environment variables
│   └── package.json
│
└── package.json            # Root workspace scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account with App Password enabled

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/learning_platform
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_USER=gentilgakiza9@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
```

**Gmail App Password Setup:**
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use that 16-character password as `EMAIL_PASS`

### 3. Start Development Servers

```bash
# Start both client and server
npm run dev

# Or start individually
npm run dev:server
npm run dev:client
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password/:token` — Reset password

### Users
- `GET /api/users/profile` — Get own profile
- `PUT /api/users/profile` — Update profile (with avatar upload)
- `GET /api/users/stats` — Get user stats
- `GET /api/users` — Get all users (admin only)
- `DELETE /api/users/:id` — Delete user (admin only)

### Courses
- `GET /api/courses` — List courses (with search/filter/pagination)
- `GET /api/courses/:id` — Get course details
- `POST /api/courses` — Create course (teacher/admin)
- `PUT /api/courses/:id` — Update course
- `DELETE /api/courses/:id` — Delete course
- `POST /api/courses/:id/enroll` — Enroll in course
- `POST /api/courses/:id/reviews` — Add review

### Reports
- `POST /api/reports/generate` — Generate report (teacher/admin)
- `GET /api/reports` — List reports
- `GET /api/reports/:id` — Get report
- `GET /api/reports/:id/download` — Download PDF
- `DELETE /api/reports/:id` — Delete report

### Video
- `POST /api/video/rooms` — Create video room
- `GET /api/video/rooms` — List rooms
- `GET /api/video/rooms/:roomId` — Get room
- `POST /api/video/rooms/:roomId/join` — Join room
- `POST /api/video/rooms/:roomId/end` — End session
- `POST /api/video/rooms/:roomId/leave` — Leave room

## WebRTC Signaling Events

The Socket.IO server handles these events for WebRTC:

- `join-room` — Join a video room
- `offer` — Send WebRTC offer
- `answer` — Send WebRTC answer
- `ice-candidate` — Exchange ICE candidates
- `leave-room` — Leave a room
- `media-state` — Broadcast audio/video state
- `chat-message` — In-room chat

## User Roles

- **student** — Can browse/enroll in courses, join video sessions, view own profile
- **teacher** — All student permissions + create courses, generate reports, host sessions
- **admin** — Full access including user management and all reports
