const express = require('express');
const router = express.Router();
const { getAttendanceHistory, markAttendance } = require('../controllers/attendanceController');

router.get('/', getAttendanceHistory);
router.post('/', markAttendance);

module.exports = router;