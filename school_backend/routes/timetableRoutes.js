const express = require('express');
const router = express.Router();
const { getTimetable, createEntry } = require('../controllers/timetableController');

router.get('/', getTimetable);
router.post('/', createEntry);

module.exports = router;