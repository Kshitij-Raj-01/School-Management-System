const express = require('express');
const router = express.Router();
const { 
  getSchedule, saveSchedule, 
  getAdmitCardAccess, setAdmitCardAccess, allowAllStudents 
} = require('../controllers/examController');

router.get('/schedule', getSchedule);
router.post('/schedule', saveSchedule);
router.get('/access', getAdmitCardAccess);
router.post('/access', setAdmitCardAccess);
router.post('/access/all', allowAllStudents);

module.exports = router;