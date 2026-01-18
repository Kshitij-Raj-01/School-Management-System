const express = require('express');
const router = express.Router();
const { getFeeStructure, updateFeeStructure } = require('../controllers/feeStructureController');

router.get('/', getFeeStructure);
router.post('/', updateFeeStructure);

module.exports = router;