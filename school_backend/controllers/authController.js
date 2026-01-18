const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = null;
    let role = '';

    // 1. Check Admin/System Users Table
    const [admins] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (admins.length > 0) {
      user = admins[0];
      role = user.role;
    }

    // 2. If not found, check Teachers Table
    if (!user) {
      const [teachers] = await db.execute('SELECT * FROM teachers WHERE email = ?', [email]);
      if (teachers.length > 0) {
        user = teachers[0];
        role = 'teacher';
        user.name = user.teacher_name; // Normalize name field
      }
    }

    // 3. If not found, check Students Table
    if (!user) {
      const [students] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
      if (students.length > 0) {
        user = students[0];
        role = 'student';
        user.name = user.student_name; // Normalize name field
      }
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // 4. Verify Password
    // Note: For students/teachers with no password set, we accept "123456" as default (Matches your mock)
    // In production, you would ALWAYS use bcrypt.compare
    const isDefaultPass = password === "123456";
    let isMatch = false;

    if (user.password_hash) {
       isMatch = await bcrypt.compare(password, user.password_hash);
    } else {
       // Allow default login if no custom password set yet
       isMatch = isDefaultPass;
    }

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // 5. Generate Token
    const token = jwt.sign({ id: user.id, role: role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      _id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: role,
      token: token,
      image: user.image_url || user.image
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Only for creating the initial Admin
exports.registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    await db.execute('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', 
    [name, email, hash, role]);
    res.json({ message: 'Admin registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};