const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getSystemUsers = async (req, res) => {
  try {
    // Fetch users who are NOT students or teachers (Assuming simple role based filter)
    // Or just fetch all non-student/teacher roles if you separate tables
    const [rows] = await db.execute("SELECT id, name, email, role, image_url FROM users WHERE role IN ('admin', 'finance', 'studentManager')");
    const users = rows.map(u => ({ ...u, _id: u.id.toString(), image: u.image_url }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSystemUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, role, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, role, `https://ui-avatars.com/api/?name=${name}`]
    );
    res.status(201).json({ _id: result.insertId.toString(), name, email, role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};