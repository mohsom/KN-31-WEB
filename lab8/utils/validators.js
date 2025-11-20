const { body, validationResult } = require('express-validator');

// Валідація для форми витрат
const validateExpense = [
    body('description')
        .notEmpty()
        .withMessage('Опис обов\'язковий')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Опис має бути від 3 до 100 символів'),
    
    body('amount')
        .notEmpty()
        .withMessage('Сума обов\'язкова')
        .isFloat({ min: 0.01 })
        .withMessage('Сума має бути більше 0'),
    
    body('category')
        .notEmpty()
        .withMessage('Категорія обов\'язкова')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Категорія має бути від 2 до 50 символів'),
    
    body('date')
        .notEmpty()
        .withMessage('Дата обов\'язкова')
        .isISO8601()
        .withMessage('Невірний формат дати')
        .custom((value) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const inputDate = new Date(value);
            inputDate.setHours(0, 0, 0, 0);
            
            if (inputDate > today) {
                throw new Error('Дата не може бути пізніше сьогодні');
            }
            return true;
        }),
    
    // Middleware для обробки помилок валідації
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array(),
                old: req.body
            });
        }
        next();
    }
];

module.exports = {
    validateExpense,
    validationResult
};

