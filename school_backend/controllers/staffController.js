const db = require('../config/db');

// --- GET ALL STAFF ---
exports.getAllStaff = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM staff');
    const staff = rows.map(s => ({
      ...s,
      _id: s.id.toString(),
      // Ensure 'work' is never undefined/null for the frontend inputs
      work: s.work_role || "", 
      // Ensure other fields are strings or empty strings to prevent React warnings
      staff_name: s.staff_name || "",
      email: s.email || "",
      contact_no: s.contact_no || ""
    }));
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- REGISTER STAFF ---
exports.registerStaff = async (req, res) => {
  const s = req.body;
  try {
    const sql = `
      INSERT INTO staff (
        staff_name, email, aadhar_no, pan_no, address, work_role, gender, contact_no, 
        qualification, previous_school, dob, age, salary, image, joining_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const joiningDate = s.joining_date || new Date().toISOString();

    const rawValues = [
      s.staff_name, s.email, s.aadhar_no, s.pan_no, s.address, s.work, s.gender, s.contact_no,
      s.qualification, s.previous_school, s.dob, s.age, s.salary, s.image, joiningDate
    ];

    // FIX: Convert undefined to null to prevent SQL crash
    const values = rawValues.map(v => (v === undefined ? null : v));

    const [result] = await db.execute(sql, values);

    res.status(201).json({ ...s, _id: result.insertId.toString() });
  } catch (err) {
    console.error("Register Staff Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- UPDATE STAFF ---
exports.updateStaff = async (req, res) => {
  const id = req.params.id;
  const s = req.body;
  try {
    const sql = `
      UPDATE staff SET 
        staff_name=?, email=?, aadhar_no=?, pan_no=?, address=?, work_role=?, gender=?, contact_no=?, 
        qualification=?, previous_school=?, dob=?, age=?, salary=?, image=?
      WHERE id = ?
    `;

    const rawValues = [
      s.staff_name, s.email, s.aadhar_no, s.pan_no, s.address, s.work, s.gender, s.contact_no,
      s.qualification, s.previous_school, s.dob, s.age, s.salary, s.image, id
    ];

    // FIX: Convert undefined to null
    const values = rawValues.map(v => (v === undefined ? null : v));

    await db.execute(sql, values);
    res.json({ ...s, _id: id });
  } catch (err) {
    console.error("Update Staff Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- DELETE STAFF ---
exports.deleteStaff = async (req, res) => {
  try {
    await db.execute('DELETE FROM staff WHERE id = ?', [req.params.id]);
    res.json({ message: 'Staff deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};