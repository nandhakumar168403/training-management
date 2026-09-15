r.get('/students', async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};

  res.json({
    students: await Student.find(filter)
      .populate('courseId', 'name')
      .populate('trainerId', 'name')
      .sort({ createdAt: -1 })
      .lean()
  });
});

// Export route must come BEFORE /students/:id
r.get('/students/export', async (req, res) => {
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
    res.status(500).json({
      message: 'Student export failed'
    });
  }
});

// Dynamic ID route must come AFTER /students/export
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

  res.json({ student, attendance });
});