const express = require('express');
const router = express.Router();
// Import updateStudent here
const { getAllStudents, registerStudent, deleteStudent, updateStudent } = require('../controllers/studentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getAllStudents); 
router.post('/', protect, adminOnly, registerStudent);

// --- ADD THIS LINE ---
router.put('/:id', protect, adminOnly, updateStudent); 

router.delete('/:id', protect, adminOnly, deleteStudent);

module.exports = router;