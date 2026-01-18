const express = require('express');
const router = express.Router();
const { 
  getAllTeachers, 
  registerTeacher, 
  deleteTeacher, 
  updateTeacher // <--- Make sure this is imported
} = require('../controllers/teacherController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getAllTeachers);
router.post('/', protect, adminOnly, registerTeacher);

// --- THIS LINE MUST EXIST ---
router.put('/:id', protect, adminOnly, updateTeacher); 

router.delete('/:id', protect, adminOnly, deleteTeacher);

module.exports = router;