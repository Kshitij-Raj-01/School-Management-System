const express = require('express');
const router = express.Router();
const { getStats, getLandingContent, updateLandingContent } = require('../controllers/dashboardController');

router.get('/stats', getStats);
router.get('/landing', getLandingContent);
router.post('/landing', updateLandingContent);

module.exports = router;