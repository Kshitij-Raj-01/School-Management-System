const db = require('../config/db');

// --- EXAM SCHEDULES ---

// Get Schedule (optionally by classname query param)
exports.getSchedule = async (req, res) => {
  const { classname } = req.query;
  try {
    let sql = 'SELECT * FROM exam_schedules';
    let params = [];
    
    if (classname) {
      sql += ' WHERE classname = ?';
      params.push(classname);
    }
    
    // Order by latest created
    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(sql, params);
    
    const schedules = rows.map(s => ({
      ...s,
      _id: s.id.toString(),
      examName: s.exam_name, // CamelCase for frontend
      examDate: s.exam_date,
      allowStudentDownload: !!s.allow_download,
      subjects: s.subjects || [] // Parse JSON automatically if driver supports it, else JSON.parse(s.subjects)
    }));

    // If fetching for a specific class, return just the object, else return array
    if (classname && schedules.length > 0) {
      res.json(schedules[0]); 
    } else {
      res.json(schedules);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save/Update Schedule
exports.saveSchedule = async (req, res) => {
  const s = req.body;
  try {
    // Check if schedule exists for this class
    const [existing] = await db.execute('SELECT id FROM exam_schedules WHERE classname = ?', [s.classname]);
    
    const subjectsJson = JSON.stringify(s.subjects);

    if (existing.length > 0) {
      // Update existing
      await db.execute(
        `UPDATE exam_schedules SET exam_name=?, exam_date=?, subjects=?, allow_download=? WHERE classname=?`,
        [s.examName, s.examDate, subjectsJson, s.allowStudentDownload, s.classname]
      );
      res.json({ ...s, message: "Schedule updated" });
    } else {
      // Create new
      await db.execute(
        `INSERT INTO exam_schedules (exam_name, exam_date, classname, subjects, allow_download) VALUES (?, ?, ?, ?, ?)`,
        [s.examName, s.examDate, s.classname, subjectsJson, s.allowStudentDownload]
      );
      res.status(201).json({ ...s, message: "Schedule created" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- ADMIT CARD ACCESS ---

// Get Access List
exports.getAdmitCardAccess = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM admit_card_access');
    const access = rows.map(a => ({
      studentId: a.student_id.toString(),
      allowed: !!a.is_allowed,
      allowedDate: a.allowed_date
    }));
    res.json(access);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle Access for Single Student
exports.setAdmitCardAccess = async (req, res) => {
  const { studentId, allowed } = req.body;
  try {
    const [existing] = await db.execute('SELECT id FROM admit_card_access WHERE student_id = ?', [studentId]);
    const date = allowed ? new Date().toISOString() : null;

    if (existing.length > 0) {
      await db.execute('UPDATE admit_card_access SET is_allowed=?, allowed_date=? WHERE student_id=?', [allowed, date, studentId]);
    } else {
      await db.execute('INSERT INTO admit_card_access (student_id, is_allowed, allowed_date) VALUES (?, ?, ?)', [studentId, allowed, date]);
    }
    res.json({ studentId, allowed, allowedDate: date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Allow All Students
exports.allowAllStudents = async (req, res) => {
  const { studentIds } = req.body; // Array of IDs
  try {
    const date = new Date().toISOString();
    // Use a transaction or simpler loop for now
    for (const id of studentIds) {
      const [existing] = await db.execute('SELECT id FROM admit_card_access WHERE student_id = ?', [id]);
      if (existing.length > 0) {
        await db.execute('UPDATE admit_card_access SET is_allowed=TRUE, allowed_date=? WHERE student_id=?', [date, id]);
      } else {
        await db.execute('INSERT INTO admit_card_access (student_id, is_allowed, allowed_date) VALUES (?, TRUE, ?)', [id, date]);
      }
    }
    res.json({ message: "All students allowed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};