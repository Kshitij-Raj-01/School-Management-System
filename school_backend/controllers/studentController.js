const db = require('../config/db');

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toISOString().split('T')[0];
};

// --- GET ALL STUDENTS ---
exports.getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM students');
    // Map 'id' to '_id' for frontend compatibility
    // Map 'uses_bus' (0/1) back to boolean
    const students = rows.map(s => ({ 
      ...s, 
      _id: s.id.toString(), 
      usesBus: !!s.uses_bus 
    }));
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- REGISTER STUDENT ---
exports.registerStudent = async (req, res) => {
  const s = req.body;
  try {
    const sql = `
      INSERT INTO students (
        admission_no, roll_no, student_name, classname, address, 
        contact_no, gender, dob, age, email, registration_fees, image, uses_bus,
        pan_no, weight, height, aadhar_no, previous_school_name, 
        alternate_mobile_no, father_name, father_aadhar_no, mother_name, mother_aadhar_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const rawValues = [
      s.admission_no, s.roll_no, s.student_name, s.classname, s.address,
      s.contact_no, s.gender, formatDate(s.dob), s.age, s.email, s.registration_fees, s.image, s.usesBus,
      s.pan_no, s.weight, s.height, s.aadhar_no, s.previous_school_name,
      s.alternate_mobile_no, s.father_name, s.father_aadhar_no, s.mother_name, s.mother_aadhar_no
    ];

    // FIX: Convert all 'undefined' values to 'null' to prevent MySQL errors
    const values = rawValues.map(v => (v === undefined ? null : v));

    const [result] = await db.execute(sql, values);
    res.status(201).json({ ...s, _id: result.insertId.toString() });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- UPDATE STUDENT ---
exports.updateStudent = async (req, res) => {
  const id = req.params.id;
  const s = req.body;
  
  try {
    const sql = `
      UPDATE students SET 
        admission_no=?, roll_no=?, student_name=?, classname=?, address=?,
        contact_no=?, gender=?, dob=?, age=?, email=?, registration_fees=?, image=?, uses_bus=?,
        pan_no=?, weight=?, height=?, aadhar_no=?, previous_school_name=?, 
        alternate_mobile_no=?, father_name=?, father_aadhar_no=?, mother_name=?, mother_aadhar_no=?
      WHERE id = ?
    `;

    const rawValues = [
      s.admission_no, s.roll_no, s.student_name, s.classname, s.address,
      s.contact_no, s.gender, s.dob, s.age, s.email, s.registration_fees, s.image, s.usesBus,
      s.pan_no, s.weight, s.height, s.aadhar_no, s.previous_school_name,
      s.alternate_mobile_no, s.father_name, s.father_aadhar_no, s.mother_name, s.mother_aadhar_no,
      id // ID goes last to match the WHERE clause
    ];

    // Ensure no undefined values
    const values = rawValues.map(v => (v === undefined ? null : v));

    await db.execute(sql, values);
    
    // Return the updated object
    res.json({ ...s, _id: id });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- DELETE STUDENT ---
exports.deleteStudent = async (req, res) => {
  try {
    await db.execute('DELETE FROM students WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};