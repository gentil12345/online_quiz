import Course from '../models/Course.js';
import User from '../models/User.js';
import { sendCourseEnrollmentEmail } from '../utils/email.js';

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Teacher/Admin
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      price,
      isFree,
      tags,
      language,
      requirements,
      whatYouLearn,
      videos,
    } = req.body;

    const courseData = {
      title,
      description,
      category,
      level: level || 'Beginner',
      instructor: req.user._id,
      price: isFree ? 0 : price || 0,
      isFree: isFree !== undefined ? isFree : true,
      tags: tags || [],
      language: language || 'English',
      requirements: requirements || [],
      whatYouLearn: whatYouLearn || [],
      videos: videos || [],
    };

    if (req.file) {
      courseData.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    const course = await Course.create(courseData);
    await course.populate('instructor', 'name email avatar profession');

    res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const category = req.query.category || '';
    const level = req.query.level || '';
    const sort = req.query.sort || '-createdAt';

    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (level) query.level = level;

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name avatar profession')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Course.countDocuments(query),
    ]);

    res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar profession bio')
      .populate('reviews.user', 'name avatar')
      .populate('enrolledStudents', 'name avatar');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid course ID' });
    }
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Teacher/Admin
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    }

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('instructor', 'name email avatar profession');

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher/Admin
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
export const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'instructor',
      'name email'
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const user = await User.findById(req.user._id);

    // Check if already enrolled
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add to user's enrolled courses
    user.enrolledCourses.push(course._id);
    await user.save();

    // Add to course's enrolled students
    course.enrolledStudents.push(user._id);
    await course.save();

    // Send enrollment email
    sendCourseEnrollmentEmail(user, course).catch(console.error);

    res.json({
      message: 'Successfully enrolled in course',
      course,
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Unenroll from course
// @route   POST /api/courses/:id/unenroll
// @access  Private
export const unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const user = await User.findById(req.user._id);

    user.enrolledCourses = user.enrolledCourses.filter(
      (c) => c.toString() !== course._id.toString()
    );
    await user.save();

    course.enrolledStudents = course.enrolledStudents.filter(
      (s) => s.toString() !== user._id.toString()
    );
    await course.save();

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenroll course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add review to course
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    const user = await User.findById(req.user._id);
    if (!user.enrolledCourses.includes(course._id)) {
      return res.status(403).json({ message: 'Must be enrolled to leave a review' });
    }

    // Check if already reviewed
    const existingReview = course.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment || '';
    } else {
      course.reviews.push({
        user: req.user._id,
        rating,
        comment: comment || '',
      });
    }

    await course.save();
    await course.populate('reviews.user', 'name avatar');

    res.json({
      message: 'Review added successfully',
      course,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get my courses (as instructor)
// @route   GET /api/courses/my/instructor
// @access  Private/Teacher
export const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
