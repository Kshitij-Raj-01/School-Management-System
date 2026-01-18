const db = require('../config/db');

// GET Structure
exports.getFeeStructure = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM fee_structure');
    // Map snake_case (DB) to camelCase (Frontend)
    const structure = rows.map(r => ({
      classname: r.classname,
      monthlyFee: r.monthly_fee,
      annualFee: r.annual_fee,
      examFee: r.exam_fee,
      otherFee: r.other_fee,
      fine: r.fine,
      busFee: r.bus_fee
    }));
    res.json(structure);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE Structure (Bulk Update)
exports.updateFeeStructure = async (req, res) => {
  const fees = req.body; // Expects an Array
  try {
    for (const f of fees) {
      const sql = `
        UPDATE fee_structure SET 
        monthly_fee=?, annual_fee=?, exam_fee=?, other_fee=?, fine=?, bus_fee=?
        WHERE classname=?
      `;
      await db.execute(sql, [
        f.monthlyFee, f.annualFee, f.examFee, f.otherFee, f.fine, f.busFee,
        f.classname
      ]);
    }
    res.json({ message: "Fee structure updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};