const express = require('express');
const router = express.Router();
const { getFeeHistory, collectFee } = require('../controllers/feeController');

router.get('/', getFeeHistory);
router.post('/pay', collectFee);

module.exports = router;