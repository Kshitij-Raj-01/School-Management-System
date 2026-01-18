const db = require('../config/db');

exports.getAttendanceHistory = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM attendance ORDER BY date DESC');
    const history = rows.map(a => ({
      ...a,
      _id: a.id.toString(),
      // Parse the JSON string back to an object/array
      records: a.student_records || [] 
    }));
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  const a = req.body;
  try {
    // 1. Check Duplicate (Same Class, Same Date, Same Subject)
    // Note: If subject is null/undefined, we check where subject IS NULL
    let checkSql = 'SELECT id FROM attendance WHERE date = ? AND classname = ?';
    let params = [a.date, a.classname];

    if (a.subject) {
      checkSql += ' AND subject = ?';
      params.push(a.subject);
    } else {
      checkSql += ' AND subject IS NULL';
    }

    const [existing] = await db.execute(checkSql, params);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Attendance already taken for this class today." });
    }

    // 2. Insert Record
    const recordsJson = JSON.stringify(a.records);
    
    const [result] = await db.execute(
      'INSERT INTO attendance (date, classname, subject, student_records) VALUES (?, ?, ?, ?)',
      [a.date, a.classname, a.subject || null, recordsJson]
    );

    res.status(201).json({ ...a, _id: result.insertId.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};