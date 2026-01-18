const db = require('../config/db');

exports.getSalaryHistory = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM salaries ORDER BY payment_date DESC');
    const history = rows.map(s => ({
      ...s,
      _id: s.id.toString(),
      employeeId: s.employee_id, // Map DB snake_case to frontend camelCase
      employeeName: s.employee_name,
      date: s.payment_date
    }));
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.paySalary = async (req, res) => {
  const s = req.body;
  try {
    // 1. Check for Duplicate
    const [existing] = await db.execute(
      'SELECT id FROM salaries WHERE employee_id = ? AND month = ? AND year = ?',
      [s.employeeId, s.month, s.year]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        message: `Salary for ${s.month} ${s.year} already paid to ${s.employeeName}.` 
      });
    }

    // 2. Insert Record
    const paymentDate = new Date().toISOString();
    const [result] = await db.execute(
      'INSERT INTO salaries (employee_id, employee_name, role, month, year, amount, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [s.employeeId, s.employeeName, s.role, s.month, s.year, s.amount, paymentDate]
    );

    res.status(201).json({ ...s, _id: result.insertId.toString(), date: paymentDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};