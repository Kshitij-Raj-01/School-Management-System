const express = require('express');
const router = express.Router();
const { addResult, getResults } = require('../controllers/resultController');

router.post('/', addResult);
router.get('/', getResults);

module.exports = router;