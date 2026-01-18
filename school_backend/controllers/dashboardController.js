const db = require('../config/db');

// --- STATISTICS ---
exports.getStats = async (req, res) => {
  try {
    // Parallel queries for speed
    const [students] = await db.execute('SELECT COUNT(*) as count FROM students');
    const [teachers] = await db.execute('SELECT COUNT(*) as count FROM teachers');
    const [staff] = await db.execute('SELECT COUNT(*) as count FROM staff');
    
    // Fee Collection Sum (Current Year)
    const currentYear = new Date().getFullYear();
    const [fees] = await db.execute(
        'SELECT SUM(total_amount) as total FROM fee_collections WHERE year = ?', 
        [currentYear.toString()]
    );

    res.json({
      students: students[0].count,
      teachers: teachers[0].count,
      staff: staff[0].count,
      totalCollection: fees[0].total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- LANDING PAGE CONTENT ---
exports.getLandingContent = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT content FROM site_content WHERE section_name = 'landing_page'");
    if (rows.length > 0) {
      res.json(rows[0].content || {});
    } else {
      res.json({});
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLandingContent = async (req, res) => {
  const content = req.body; // Full JSON object
  try {
    const jsonStr = JSON.stringify(content);
    // Upsert (Insert if not exists, update if exists)
    const sql = `
      INSERT INTO site_content (section_name, content) VALUES ('landing_page', ?)
      ON DUPLICATE KEY UPDATE content = VALUES(content)
    `;
    await db.execute(sql, [jsonStr]);
    res.json({ message: "Content updated", content });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};