const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');

router.get('/', getNotices);
router.post('/', createNotice);
router.delete('/:id', deleteNotice);

module.exports = router;