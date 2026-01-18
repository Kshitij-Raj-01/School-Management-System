const db = require('../config/db');

exports.getNotices = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM notices ORDER BY date DESC');
    const notices = rows.map(n => ({
      ...n,
      id: n.id.toString(), // Frontend uses 'id' string for notices
      targetAudience: n.target_audience,
      postedBy: n.posted_by,
      isImportant: !!n.is_important
    }));
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createNotice = async (req, res) => {
  const n = req.body;
  try {
    const date = new Date().toISOString();
    const [result] = await db.execute(
      'INSERT INTO notices (title, content, target_audience, posted_by, is_important, date) VALUES (?, ?, ?, ?, ?, ?)',
      [n.title, n.content, n.targetAudience, n.postedBy, n.isImportant, date]
    );

    res.status(201).json({ ...n, id: result.insertId.toString(), date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    await db.execute('DELETE FROM notices WHERE id = ?', [req.params.id]);
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};