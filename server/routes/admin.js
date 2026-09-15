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

r.use(requireAdmin);

// Dashboard
r.get('/dashboard', async (req, res) => {
  const [
    students,
    trainers,
    courses,
    attendance
  ] = await Promise.all([
    Student.countDocuments(),
    Trainer.countDocuments(),
    Course.countDocuments(),
    Attendance.countDocuments({
      attendanceDate: {
        $gte: new Date(
          new Date().setHours(0, 0, 0, 0)
        ),
        $lt: new Date(
          new Date().setHours(24, 0, 0, 0)
        )
      }
    })
  ]);

  res.json({
    stats: {
      students,
      trainers,
      courses,
      todayAttendance: attendance
    }
  });
});

// Trainers
r.get('/trainers', async (req, res) => {
  res.json({
    trainers: await Trainer.find()
      .sort({ createdAt: -1 })
      .lean()
  });
});

r.post('/trainers', async (req, res) => {
  res.status(201).json({
    trainer: await Trainer.create(req.body)
  });
});

r.put('/trainers/:id', async (req, res) => {
  res.json({
    trainer: await Trainer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
  });
});

r.delete('/trainers/:id', async (req, res) => {
  await Trainer.findByIdAndDelete(req.params.id);

  res.json({
    message: 'Trainer deleted'
  });
});

// Students
r.get('/students', async (req, res) => {
  const filter = req.query.status
    ? { status: req.query.status }
    : {};

  res.json({
    students: await Student.find(filter)
      .populate('courseId', 'name')
      .populate('trainerId', 'name')
      .sort({ createdAt: -1 })
      .lean()
  });
});

// Student export route must come before /students/:id
r.get('/students/export', async (req, res) => {
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
        ? new Date(s.joiningDate)
            .toISOString()
            .slice(0, 10)
        : '',
      s.status || ''
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

  res.send(toCsv(rows));
});

// Get student by ID
r.get('/students/:id', async (req, res) => {
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
});

r.patch('/students/:id/status', async (req, res) => {
  if (
    !['pending', 'approved', 'rejected'].includes(
      req.body.status
    )
  ) {
    return res.status(400).json({
      message: 'Invalid status'
    });
  }

  res.json({
    student: await Student.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status
      },
      {
        new: true
      }
    ).populate('courseId', 'name')
  });
});

// Attendance
r.get('/attendance', async (req, res) => {
  const filter = req.query.trainerId
    ? { trainerId: req.query.trainerId }
    : {};

  res.json({
    attendance: await Attendance.find(filter)
      .populate(
        'studentId',
        'name email phoneNumber'
      )
      .populate('courseId', 'name')
      .populate('trainerId', 'name')
      .sort({ attendanceDate: -1 })
      .lean(),

    trainers: await Trainer.find()
      .select('name')
      .lean()
  });
});

r.patch('/attendance/:id/status', async (req, res) => {
  if (!['present', 'absent'].includes(req.body.status)) {
    return res.status(400).json({
      message: 'Status must be present or absent'
    });
  }

  res.json({
    attendance: await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        reviewedBy: req.admin.username
      },
      {
        new: true
      }
    )
  });
});

// Courses
r.get('/courses', async (req, res) => {
  res.json({
    courses: await Course.find().lean()
  });
});

r.post('/courses', async (req, res) => {
  res.status(201).json({
    course: await Course.create(req.body)
  });
});

r.put('/courses/:id', async (req, res) => {
  res.json({
    course: await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
  });
});

r.delete('/courses/:id', async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);

  res.json({
    message: 'Course deleted'
  });
});

export default r;