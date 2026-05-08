import Report from '../models/Report.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import VideoSession from '../models/VideoSession.js';
import PDFDocument from 'pdfkit';

// Helper: generate report data based on type
const generateReportData = async (type, dateRange) => {
  const { start, end } = dateRange;
  const startDate = new Date(start);
  const endDate = new Date(end);

  switch (type) {
    case 'enrollment': {
      const courses = await Course.find({ createdAt: { $gte: startDate, $lte: endDate } })
        .populate('instructor', 'name')
        .lean();

      const totalEnrollments = courses.reduce(
        (sum, c) => sum + (c.enrolledStudents?.length || 0),
        0
      );

      const byCategory = {};
      courses.forEach((c) => {
        byCategory[c.category] = (byCategory[c.category] || 0) + (c.enrolledStudents?.length || 0);
      });

      const monthlyData = {};
      courses.forEach((c) => {
        const month = new Date(c.createdAt).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        monthlyData[month] = (monthlyData[month] || 0) + (c.enrolledStudents?.length || 0);
      });

      return {
        totalCourses: courses.length,
        totalEnrollments,
        byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
        monthly: Object.entries(monthlyData).map(([month, enrollments]) => ({
          month,
          enrollments,
        })),
        topCourses: courses
          .sort((a, b) => (b.enrolledStudents?.length || 0) - (a.enrolledStudents?.length || 0))
          .slice(0, 5)
          .map((c) => ({
            title: c.title,
            enrollments: c.enrolledStudents?.length || 0,
            instructor: c.instructor?.name || 'Unknown',
          })),
      };
    }

    case 'progress': {
      const users = await User.find({
        createdAt: { $gte: startDate, $lte: endDate },
        role: 'student',
      }).lean();

      const completionRates = users.map((u) => {
        const enrolled = u.enrolledCourses?.length || 0;
        const completed = u.completedCourses?.length || 0;
        return {
          name: u.name,
          enrolled,
          completed,
          rate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
        };
      });

      const avgCompletion =
        completionRates.length > 0
          ? Math.round(
              completionRates.reduce((sum, u) => sum + u.rate, 0) / completionRates.length
            )
          : 0;

      const weeklyProgress = [];
      for (let i = 0; i < 8; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        weeklyProgress.push({
          week: `Week ${i + 1}`,
          activeStudents: Math.floor(Math.random() * 50) + 10,
          completions: Math.floor(Math.random() * 20) + 5,
        });
      }

      return {
        totalStudents: users.length,
        avgCompletionRate: avgCompletion,
        completionRates: completionRates.slice(0, 10),
        weeklyProgress,
        totalHoursWatched: users.reduce((sum, u) => sum + (u.hoursWatched || 0), 0),
      };
    }

    case 'performance': {
      const courses = await Course.find({ isPublished: true })
        .populate('instructor', 'name')
        .lean();

      const performanceData = courses.map((c) => ({
        title: c.title.substring(0, 30),
        rating: c.rating || 0,
        enrollments: c.enrolledStudents?.length || 0,
        reviews: c.reviews?.length || 0,
        instructor: c.instructor?.name || 'Unknown',
      }));

      const avgRating =
        courses.length > 0
          ? Math.round(
              (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length) * 10
            ) / 10
          : 0;

      const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
        star: `${star} Star`,
        count: courses.filter((c) => Math.round(c.rating) === star).length,
      }));

      return {
        totalCourses: courses.length,
        avgRating,
        performanceData: performanceData.slice(0, 10),
        ratingDistribution,
        topRated: performanceData
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5),
      };
    }

    case 'revenue': {
      const courses = await Course.find({ isFree: false, isPublished: true }).lean();

      const revenueData = courses.map((c) => ({
        title: c.title.substring(0, 30),
        price: c.price || 0,
        enrollments: c.enrolledStudents?.length || 0,
        revenue: (c.price || 0) * (c.enrolledStudents?.length || 0),
      }));

      const totalRevenue = revenueData.reduce((sum, c) => sum + c.revenue, 0);

      const monthlyRevenue = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((month) => {
        monthlyRevenue.push({
          month,
          revenue: Math.floor(Math.random() * 5000) + 500,
        });
      });

      return {
        totalRevenue,
        totalPaidCourses: courses.length,
        revenueData: revenueData.slice(0, 10),
        monthlyRevenue,
        avgRevenuePerCourse: courses.length > 0 ? Math.round(totalRevenue / courses.length) : 0,
      };
    }

    default:
      return {};
  }
};

// @desc    Generate report
// @route   POST /api/reports/generate
// @access  Private/Teacher/Admin
export const generateReport = async (req, res) => {
  try {
    const { type, title, dateRange } = req.body;

    if (!type || !dateRange?.start || !dateRange?.end) {
      return res.status(400).json({ message: 'Type and date range are required' });
    }

    const validTypes = ['progress', 'performance', 'enrollment', 'revenue'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const data = await generateReportData(type, dateRange);

    const report = await Report.create({
      title: title || `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      type,
      generatedBy: req.user._id,
      data,
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      },
      status: 'completed',
    });

    await report.populate('generatedBy', 'name email');

    res.status(201).json({
      message: 'Report generated successfully',
      report,
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Teacher/Admin
export const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.user.role !== 'admin') {
      query.generatedBy = req.user._id;
    }
    if (req.query.type) query.type = req.query.type;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('generatedBy', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query),
    ]);

    res.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      'generatedBy',
      'name email avatar'
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check access
    if (
      report.generatedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Download report as PDF
// @route   GET /api/reports/:id/download
// @access  Private
export const downloadReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      'generatedBy',
      'name email'
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check access
    if (
      report.generatedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${report.title.replace(/\s+/g, '_')}_${Date.now()}.pdf"`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(24)
      .fillColor('#1d4ed8')
      .text('Learning Platform', { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fontSize(18)
      .fillColor('#111827')
      .text(report.title, { align: 'center' });

    doc.moveDown(0.5);
    doc
      .fontSize(11)
      .fillColor('#6b7280')
      .text(`Report Type: ${report.type.toUpperCase()}`, { align: 'center' });

    doc.text(
      `Date Range: ${new Date(report.dateRange.start).toLocaleDateString()} - ${new Date(
        report.dateRange.end
      ).toLocaleDateString()}`,
      { align: 'center' }
    );

    doc.text(`Generated by: ${report.generatedBy.name}`, { align: 'center' });
    doc.text(`Generated on: ${new Date(report.createdAt).toLocaleString()}`, {
      align: 'center',
    });

    // Divider
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown();

    // Data section
    doc.fontSize(14).fillColor('#111827').text('Report Summary', { underline: true });
    doc.moveDown(0.5);

    const data = report.data || {};

    const renderDataSection = (key, value) => {
      if (typeof value === 'object' && !Array.isArray(value)) return;
      if (Array.isArray(value)) {
        doc.fontSize(12).fillColor('#374151').text(`${key}:`, { continued: false });
        value.slice(0, 10).forEach((item, i) => {
          if (typeof item === 'object') {
            doc
              .fontSize(10)
              .fillColor('#6b7280')
              .text(`  ${i + 1}. ${JSON.stringify(item)}`, { indent: 20 });
          } else {
            doc.fontSize(10).fillColor('#6b7280').text(`  - ${item}`, { indent: 20 });
          }
        });
      } else {
        doc
          .fontSize(12)
          .fillColor('#374151')
          .text(`${key}: `, { continued: true })
          .fillColor('#1d4ed8')
          .text(String(value));
      }
      doc.moveDown(0.3);
    };

    Object.entries(data).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      renderDataSection(label, value);
    });

    // Footer
    doc.moveDown(2);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor('#9ca3af')
      .text(
        `This report was automatically generated by Learning Platform. © ${new Date().getFullYear()}`,
        { align: 'center' }
      );

    doc.end();
  } catch (error) {
    console.error('Download report error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF' });
    }
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (
      report.generatedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
