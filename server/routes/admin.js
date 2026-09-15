import { Router } from 'express';
import mongoose from 'mongoose';

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

    res.status(200).json({ students });
  } catch (error) {
    next(error);
  }
});

// Export all students
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
      ...students.map((student) => [
        student.name || '',
        student.email || '',
        student.phoneNumber || '',
        student.location || '',
        student.courseId?.name || '',
        student.preferredTiming || '',
        student.joiningDate
          ? new Date(student.joiningDate).toISOString().slice(0, 10)
          : '',
        student.status || ''
      ])
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="students-details.csv"'
    );

    return res.status(200).send(toCsv(rows));
  } catch (error) {
    console.error('Student export error:', error);
    next(error);
  }
});

// Get one student by ID
// This route must come after /students/export
r.get('/students/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: 'Invalid student ID'
      });
    }

    const student = await Student.findById(id)
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

    return res.status(200).json({
      student,
      attendance
    });
  } catch (error) {
    next(error);
  }
});

// Admin route error handler
r.use((error, req, res, next) => {
  console.error('Admin route error:', error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: 'Internal server error'
  });
});

// Required because src.js imports admin as default
export default r;