const { body, validationResult } = require('express-validator');
const { readUsers } = require('../utils/db');
const bcrypt = require('bcrypt');

// Валідація реєстрації
const validateRegister = [
    body('fullName')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('ПІБ має бути від 3 до 30 символів')
        .matches(/^[а-яА-ЯёЁa-zA-Z\s]+$/)
        .withMessage('ПІБ може містити тільки літери та пробіли'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('Невірний формат email')
        .normalizeEmail()
        .custom(async (value) => {
            const users = readUsers();
            const existingUser = users.find(u => u.email.toLowerCase() === value.toLowerCase());
            if (existingUser) {
                throw new Error('Користувач з таким email вже існує');
            }
            return true;
        }),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль має бути мінімум 6 символів'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Паролі не збігаються');
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errors', errors.array());
            req.flash('old', req.body);
            return res.redirect('/register');
        }
        next();
    }
];

// Валідація входу
const validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Невірний формат email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Пароль обов\'язковий'),

    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('errors', errors.array());
            req.flash('old', req.body);
            return res.redirect('/login');
        }

        // Перевірка існування користувача та пароля
        const users = readUsers();
        const user = users.find(u => u.email.toLowerCase() === req.body.email.toLowerCase());

        if (!user) {
            req.flash('errors', [{ msg: 'Користувач з таким email не знайдено' }]);
            req.flash('old', req.body);
            return res.redirect('/login');
        }

        const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

        if (!isPasswordValid) {
            req.flash('errors', [{ msg: 'Невірний пароль' }]);
            req.flash('old', req.body);
            return res.redirect('/login');
        }

        // Зберегти користувача в req для використання в маршруті
        req.user = user;
        next();
    }
];

module.exports = {
    validateRegister,
    validateLogin
};

