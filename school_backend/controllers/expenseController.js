const db = require('../config/db');

exports.getExpenses = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM expenses ORDER BY date DESC');
    const expenses = rows.map(e => ({
      ...e,
      _id: e.id.toString(), // Frontend expects _id
      date: e.date
    }));
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addExpense = async (req, res) => {
  const e = req.body;
  try {
    const sql = `INSERT INTO expenses (title, amount, category, description, date) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [
      e.title, e.amount, e.category, e.description, e.date
    ]);
    res.status(201).json({ ...e, _id: result.insertId.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await db.execute('DELETE FROM expenses WHERE id = ?', [req.params.id]);
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};