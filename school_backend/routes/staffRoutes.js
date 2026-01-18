const express = require('express');
const router = express.Router();
const { getAllStaff, registerStaff, deleteStaff, updateStaff } = require('../controllers/staffController');

router.get('/', getAllStaff);
router.post('/', registerStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;