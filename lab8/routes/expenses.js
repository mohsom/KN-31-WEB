const express = require('express');
const router = express.Router();
const { readData, writeData, getNextId } = require('../utils/fileHandler');
const { validateExpense } = require('../utils/validators');

// GET /api/expenses - отримати всі витрати
router.get('/', (req, res) => {
    try {
        const expenses = readData();
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/expenses - додати нову витрату (з валідацією)
router.post('/', validateExpense, (req, res) => {
    try {
        const { description, amount, category, date } = req.body;
        
        const expenses = readData();
        const newExpense = {
            id: getNextId(expenses),
            description: description.trim(),
            amount: parseFloat(amount),
            category: category.trim(),
            date: date,
            createdAt: new Date().toISOString()
        };
        
        expenses.push(newExpense);
        writeData(expenses);
        
        res.status(201).json({
            success: true,
            message: 'Витрату додано успішно!',
            expense: newExpense
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router;

