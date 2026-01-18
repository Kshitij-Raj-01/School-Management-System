const db = require('../config/db');

exports.getTimetable = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM timetable');
    const schedule = rows.map(t => ({
      ...t,
      _id: t.id.toString(),
      teacherId: t.teacher_id,     // Map DB snake_case to frontend camelCase
      teacherName: t.teacher_name,
      startTime: t.start_time,
      endTime: t.end_time
    }));
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEntry = async (req, res) => {
  const t = req.body;
  try {
    const sql = `
      INSERT INTO timetable (
        classname, subject, teacher_id, teacher_name, day, start_time, end_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      t.classname, t.subject, t.teacherId, t.teacherName, t.day, t.startTime, t.endTime
    ]);

    res.status(201).json({ ...t, _id: result.insertId.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};