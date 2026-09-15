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

/*
|--------------------------------------------------------------------------
| DASHBOARD
|--------------------------------------------------------------------------
*/

r.get('/dashboard', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      studentsCount,
      trainersCount,
      coursesCount,
      todayAttendanceCount
    ] = await Promise.all([
      Student.countDocuments(),
      Trainer.countDocuments(),
      Course.countDocuments(),
      Attendance.countDocuments({
        attendanceDate: {
          $gte: today,
          $lt: tomorrow
        }
      })
    ]);

    const dashboard = {
      students: studentsCount,
      trainers: trainersCount,
      courses: coursesCount,
      todayAttendance: todayAttendanceCount
    };

    return res.status(200).json({
      dashboard,

      // Direct fields are also returned for frontend compatibility
      students: studentsCount,
      trainers: trainersCount,
      courses: coursesCount,
      todayAttendance: todayAttendanceCount
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| TRAINERS
|--------------------------------------------------------------------------
*/

// Get all trainers
r.get('/trainers', async (req, res, next) => {
  try {
    const trainers = await Trainer.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      trainers
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| ATTENDANCE
|--------------------------------------------------------------------------
*/

// Get all attendance records
r.get('/attendance', async (req, res, next) => {
  try {
    const attendance = await Attendance.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'name')
      .populate('trainerId', 'name')
      .sort({ attendanceDate: -1 })
      .lean();

    return res.status(200).json({
      attendance
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| COURSES
|--------------------------------------------------------------------------
*/

// Get all courses
r.get('/courses', async (req, res, next) => {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      courses
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| STUDENTS
|--------------------------------------------------------------------------
*/

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

    return res.status(200).json({
      students
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| EXPORT STUDENTS
|--------------------------------------------------------------------------
*/

// Export students as CSV
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
          ? new Date(student.joiningDate)
              .toISOString()
              .slice(0, 10)
          : '',
        student.status || ''
      ])
    ];

    res.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8'
    );

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

/*
|--------------------------------------------------------------------------
| GET SINGLE STUDENT
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

r.use((error, req, res, next) => {
  console.error('Admin route error:', error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    message: 'Internal server error'
  });
});

/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

export default r;