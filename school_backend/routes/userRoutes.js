const express = require('express');
const router = express.Router();
const { getSystemUsers, createSystemUser, deleteUser } = require('../controllers/userController');

router.get('/', getSystemUsers);
router.post('/', createSystemUser);
router.delete('/:id', deleteUser);

module.exports = router;