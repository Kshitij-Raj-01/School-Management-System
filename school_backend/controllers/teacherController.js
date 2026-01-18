const db = require('../config/db');

// --- GET ALL TEACHERS ---
exports.getAllTeachers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM teachers');
    const teachers = rows.map(t => {
      // 1. READ FROM CORRECT COLUMN: 'subjects_to_teach'
      // We check both just in case, but prioritize the one you said is in DB
      let rawData = t.subjects_to_teach || t.subjects || "[]";
      let subjects = [];

      // 2. ROBUST PARSING LOGIC
      if (rawData) {
        if (typeof rawData === 'string') {
          try {
            subjects = JSON.parse(rawData);
          } catch (e) {
            // If it's a plain string like "Math, Science", split it
            // Also handles cleaning up quotes/brackets if JSON parse failed
            subjects = rawData
              .replace(/[\[\]"']/g, "") // Remove [ ] " '
              .split(',')               // Split by comma
              .map(s => s.trim())       // Trim whitespace
              .filter(s => s !== "");   // Remove empty
          }
        } else if (Array.isArray(rawData)) {
          subjects = rawData;
        }
      }

      return {
        ...t,
        _id: t.id.toString(),
        subjectsToTeach: subjects // Send clean array to frontend
      };
    });
    
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- REGISTER TEACHER ---
exports.registerTeacher = async (req, res) => {
  const t = req.body;
  try {
    // Convert array to JSON string for storage
    const subjects = JSON.stringify(t.subjectsToTeach || []);

    // FIX: Changed 'subjects' to 'subjects_to_teach'
    const sql = `
      INSERT INTO teachers (
        teacher_name, email, aadhar_no, pan_no, address, gender, contact_no, qualification, 
        subjects_to_teach, class_teacher_of, previous_school, dob, age, estimated_salary, image, joining_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const joiningDate = t.joining_date || new Date().toISOString();

    const [result] = await db.execute(sql, [
      t.teacher_name, t.email, t.aadhar_no, t.pan_no, t.address, t.gender, t.contact_no, t.qualification,
      subjects, t.classTeacherOf, t.previous_school, t.dob, t.age, t.estimated_salary, t.image, joiningDate
    ]);

    res.status(201).json({ ...t, _id: result.insertId.toString() });
  } catch (err) {
    console.error("Register Teacher Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- UPDATE TEACHER ---
exports.updateTeacher = async (req, res) => {
  const id = req.params.id;
  const t = req.body;
  
  try {
    // Ensure subjects is a string for MySQL
    const subjects = Array.isArray(t.subjectsToTeach) 
      ? JSON.stringify(t.subjectsToTeach) 
      : t.subjectsToTeach;

    // FIX: Changed 'subjects=?' to 'subjects_to_teach=?'
    const sql = `
      UPDATE teachers SET 
        teacher_name=?, email=?, aadhar_no=?, pan_no=?, address=?, gender=?, contact_no=?, qualification=?, 
        subjects_to_teach=?, class_teacher_of=?, previous_school=?, dob=?, age=?, estimated_salary=?, image=?
      WHERE id = ?
    `;

    // Handle undefined values safely
    const rawValues = [
      t.teacher_name, t.email, t.aadhar_no, t.pan_no, t.address, t.gender, t.contact_no, t.qualification,
      subjects, t.classTeacherOf, t.previous_school, t.dob, t.age, t.estimated_salary, t.image,
      id
    ];
    const values = rawValues.map(v => (v === undefined ? null : v));

    await db.execute(sql, values);
    
    res.json({ ...t, _id: id });
  } catch (err) {
    console.error("Update Teacher Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- DELETE TEACHER ---
exports.deleteTeacher = async (req, res) => {
  try {
    await db.execute('DELETE FROM teachers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};