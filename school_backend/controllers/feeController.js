const db = require('../config/db');

// Get Fee History
exports.getFeeHistory = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM fee_collections ORDER BY payment_date DESC');
    
    // Map Database fields (snake_case) to Frontend fields (camelCase)
    const history = rows.map(f => ({
      _id: f.id.toString(),
      studentId: f.student_id,
      studentName: f.student_name,   // <--- FIX: Maps student_name to studentName
      classname: f.classname,
      roll_no: f.roll_no,
      month: f.month,
      year: f.year,
      monthly_fees: Number(f.monthly_fees),
      exam_fees: Number(f.exam_fees),
      other_fee: Number(f.other_fee),
      fine: Number(f.fine),
      totalAmount: Number(f.total_amount), // <--- FIX: Maps total_amount to totalAmount
      date: f.payment_date,
      paymentMode: f.payment_mode,
      notes: f.notes || "",
      receiptNo: f.receipt_no || ""
    }));
    
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Collect Fee
exports.collectFee = async (req, res) => {
  const f = req.body;
  try {
    // 1. Check for Duplicate
    const [existing] = await db.execute(
      'SELECT id FROM fee_collections WHERE student_id = ? AND month = ? AND year = ?',
      [f.studentId, f.month, f.year]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        message: `Fees for ${f.month} ${f.year} already collected for this student.` 
      });
    }

    // 2. Insert Record
    const sql = `
      INSERT INTO fee_collections (
        student_id, student_name, classname, roll_no, month, year,
        monthly_fees, fine, other_fee, exam_fees, total_amount, payment_date, uses_bus, payment_mode, notes, receipt_no
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const paymentDate = new Date().toISOString();

    const [result] = await db.execute(sql, [
      f.studentId, f.studentName, f.classname, f.roll_no, f.month, f.year,
      f.monthly_fees, f.fine, f.other_fee,
      f.exam_fees || 0, f.totalAmount, paymentDate, f.usesBus ? 1 : 0, f.paymentMode || 'Cash',
      f.notes || "", f.receiptNo || ""
    ]);

    // Return the object exactly as the frontend expects it
    res.status(201).json({ ...f, _id: result.insertId.toString(), date: paymentDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};