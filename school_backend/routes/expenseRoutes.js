const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');

router.get('/', getExpenses);
router.post('/', addExpense);
router.delete('/:id', deleteExpense);

module.exports = router;