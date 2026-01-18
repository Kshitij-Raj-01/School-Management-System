const db = require('../config/db');

exports.addResult = async (req, res) => {
  const r = req.body;
  try {
    // 1. Check existing record includes academic_year
    const [existing] = await db.execute(
      'SELECT id FROM exam_results WHERE student_id = ? AND exam_name = ? AND subject = ? AND academic_year = ?',
      [r.studentId, r.examName, r.subject, r.academicYear] // <--- Added academicYear
    );

    if (existing.length > 0) {
      await db.execute(
        `UPDATE exam_results SET marks_obtained=?, total_marks=?, grade=?, remarks=? 
         WHERE id=?`,
        [r.marksObtained, r.totalMarks, r.grade, r.remarks, existing[0].id]
      );
      return res.json({ message: "Result updated" });
    }

    // 2. Insert New with academic_year
    const sql = `
      INSERT INTO exam_results (
        student_id, student_name, admission_no, classname, academic_year, 
        exam_name, subject, marks_obtained, total_marks, grade, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      r.studentId, r.studentName, r.admissionNo, r.classname, r.academicYear, // <--- Added here
      r.examName, r.subject, r.marksObtained, r.totalMarks, r.grade, r.remarks
    ]);

    res.status(201).json({ ...r, _id: result.insertId.toString() });
  } catch (err) {
    console.error("Add Result Error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getResults = async (req, res) => {
  const { studentId, classname, examName, academicYear } = req.query; // <--- Accept from query
  try {
    let sql = 'SELECT * FROM exam_results';
    let params = [];
    let conditions = [];

    if (studentId) { conditions.push('student_id = ?'); params.push(studentId); }
    if (classname) { conditions.push('classname = ?'); params.push(classname); }
    if (examName) { conditions.push('exam_name = ?'); params.push(examName); }
    
    // Filter by Academic Year
    if (academicYear) { conditions.push('academic_year = ?'); params.push(academicYear); }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(sql, params);
    
    const results = rows.map(r => ({
      _id: r.id.toString(),
      studentId: r.student_id.toString(),
      studentName: r.student_name,
      admissionNo: r.admission_no,
      classname: r.classname,
      academicYear: r.academic_year, // <--- Send back to frontend
      examName: r.exam_name,
      subject: r.subject,
      marksObtained: Number(r.marks_obtained), 
  totalMarks: Number(r.total_marks),
      grade: r.grade,
      remarks: r.remarks
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};