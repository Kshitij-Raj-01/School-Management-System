const express = require('express');
const router = express.Router();
const { getSalaryHistory, paySalary } = require('../controllers/salaryController');

router.get('/', getSalaryHistory);
router.post('/pay', paySalary);

module.exports = router;