import { Router } from 'express';

import { requireAdmin } from '../middleware/auth.js';

import {
  Student,
  Trainer,
  Attendance,
  Course
} from '../models.js';

import { toCsv } from '../utils/csv.js';

const r = Router();

// Protect all admin routes
r.use(requireAdmin);

// Get all students
r.get('/students', async (req, res, next) => {
  try {
    const filter = req.query.status
      ? { status: req.query.status }
      : {};

    const students = await Student.find(filter)
      .populate('courseId', 'name')
      .populate('trainerId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ students });
  } catch (error) {
    next(error);
  }
});

// Export students
// This route must come before /students/:id
r.get('/students/export', async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate('courseId', 'name')
      .lean();

    const rows = [
      [
        'Name',
        'Email',
        'Phone',
        'Location',
        'Course',
        'Timing',
        'Joining Date',
        'Status'
      ],
      ...students.map((s) => [
        s.name || '',
        s.email || '',
        s.phoneNumber || '',
        s.location || '',
        s.courseId?.name || '',
        s.preferredTiming || '',
        s.joiningDate
          ? new Date(s.joiningDate).toISOString().slice(0, 10)
          : '',
        s.status || ''
      ])
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="students-details.csv"'
    );

    res.send(toCsv(rows));
  } catch (error) {
    console.error('Student export error:', error);
    next(error);
  }
});

// Get a single student by ID
// This route must come after /students/export
r.get('/students/:id', async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('courseId', 'name')
      .populate('trainerId', 'name')
      .lean();

    if (!student) {
      return res.status(404).json({
        message: 'Student not found'
      });
    }

    const attendance = await Attendance.find({
      studentId: student._id
    })
      .populate('courseId', 'name')
      .populate('trainerId', 'name')
      .sort({ attendanceDate: -1 })
      .lean();

    res.json({
      student,
      attendance
    });
  } catch (error) {
    next(error);
  }
});

// Error handler
r.use((error, req, res, next) => {
  console.error('Admin route error:', error);

  res.status(500).json({
    message: 'Internal server error'
  });
});

// Important: export the router as default
export default r;