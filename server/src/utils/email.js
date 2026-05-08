import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const baseEmailTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Learning Platform</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px; color: #333; line-height: 1.6; }
    .button { display: inline-block; padding: 12px 28px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; color: #888; font-size: 13px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 Learning Platform</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Learning Platform. All rights reserved.</p>
      <p>Sent from <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
    </div>
  </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const content = `
      <h2>Welcome, ${user.name}! 🎉</h2>
      <p>Thank you for joining the Learning Platform. We're excited to have you on board!</p>
      <p>Your account has been created successfully with the following details:</p>
      <ul>
        <li><strong>Name:</strong> ${user.name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Role:</strong> ${user.role}</li>
      </ul>
      <p>You can now:</p>
      <ul>
        <li>Browse and enroll in courses</li>
        <li>Join live video sessions</li>
        <li>Build your professional profile</li>
        <li>Track your learning progress</li>
      </ul>
      <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
      <p>If you have any questions, feel free to reach out to us.</p>
      <p>Happy learning! 🚀</p>
    `;

    await transporter.sendMail({
      from: `"Learning Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🎓 Welcome to Learning Platform!',
      html: baseEmailTemplate(content),
    });

    console.log(`✅ Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error.message);
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const content = `
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>You requested a password reset for your Learning Platform account.</p>
      <p>Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
      <p>For security, this link will expire in 1 hour.</p>
    `;

    await transporter.sendMail({
      from: `"Learning Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🔐 Password Reset - Learning Platform',
      html: baseEmailTemplate(content),
    });

    console.log(`✅ Password reset email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error.message);
  }
};

export const sendCourseEnrollmentEmail = async (user, course) => {
  try {
    const transporter = createTransporter();

    const content = `
      <h2>Course Enrollment Confirmed! 📚</h2>
      <p>Hi ${user.name},</p>
      <p>You have successfully enrolled in the following course:</p>
      <div style="background:#f0f9ff;border-left:4px solid #3b82f6;padding:16px;margin:16px 0;border-radius:4px;">
        <h3 style="margin:0 0 8px;">${course.title}</h3>
        <p style="margin:0;color:#555;">Category: ${course.category} | Level: ${course.level}</p>
      </div>
      <p>You can start learning right away by visiting your dashboard.</p>
      <a href="${process.env.CLIENT_URL}/courses/${course._id}" class="button">Start Learning</a>
      <p>Good luck with your studies! 🌟</p>
    `;

    await transporter.sendMail({
      from: `"Learning Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `📚 Enrolled in "${course.title}" - Learning Platform`,
      html: baseEmailTemplate(content),
    });

    console.log(`✅ Enrollment email sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending enrollment email:', error.message);
  }
};

export const sendVideoSessionInvite = async (user, session, hostName) => {
  try {
    const transporter = createTransporter();
    const sessionUrl = `${process.env.CLIENT_URL}/video-call/${session.roomId}`;

    const content = `
      <h2>Video Session Invitation 🎥</h2>
      <p>Hi ${user.name},</p>
      <p><strong>${hostName}</strong> has invited you to join a live video session.</p>
      <div style="background:#f5f3ff;border-left:4px solid #8b5cf6;padding:16px;margin:16px 0;border-radius:4px;">
        <h3 style="margin:0 0 8px;">${session.title}</h3>
        <p style="margin:0;color:#555;">Room ID: <strong>${session.roomId}</strong></p>
      </div>
      <a href="${sessionUrl}" class="button">Join Session</a>
      <p>Make sure your camera and microphone are ready before joining.</p>
    `;

    await transporter.sendMail({
      from: `"Learning Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎥 Video Session Invitation - ${session.title}`,
      html: baseEmailTemplate(content),
    });

    console.log(`✅ Session invite sent to ${user.email}`);
  } catch (error) {
    console.error('❌ Error sending session invite:', error.message);
  }
};
