const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const { readUsers, writeUsers } = require('./utils/db');
const { isAuthenticated, isNotAuthenticated } = require('./middleware/auth');
const { validateRegister, validateLogin } = require('./middleware/validator');

const app = express();
const PORT = 3000;

// Налаштування EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware для парсингу даних
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Налаштування сесій
app.use(session({
    secret: 'lab9-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Встановити true для HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 години
    }
}));

// Flash messages
app.use(flash());

// Middleware для передачі flash messages у всі шаблони
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.errors = req.flash('errors');
    res.locals.old = req.flash('old')[0] || {};
    res.locals.user = req.session.userId ? readUsers().find(u => u.id === req.session.userId) : null;
    next();
});

// Статичні файли
app.use(express.static('public'));

// Головна сторінка - редірект залежно від авторизації
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

// GET /register - форма реєстрації
app.get('/register', isNotAuthenticated, (req, res) => {
    res.render('register');
});

// POST /register - обробка реєстрації
app.post('/register', isNotAuthenticated, validateRegister, async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const users = readUsers();

        // Хешування пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Створення нового користувача
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        // Створення сесії
        req.session.userId = newUser.id;

        req.flash('success', 'Реєстрація успішна! Вітаємо!');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        req.flash('error', 'Помилка при реєстрації. Спробуйте ще раз.');
        res.redirect('/register');
    }
});

// GET /login - форма входу
app.get('/login', isNotAuthenticated, (req, res) => {
    res.render('login');
});

// POST /login - обробка входу
app.post('/login', isNotAuthenticated, validateLogin, (req, res) => {
    // Користувач вже перевірений в validateLogin middleware
    req.session.userId = req.user.id;
    req.flash('success', 'Вітаємо! Ви успішно увійшли в систему.');
    res.redirect('/dashboard');
});

// GET /dashboard - захищена сторінка
app.get('/dashboard', isAuthenticated, (req, res) => {
    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);

    if (!user) {
        req.session.destroy();
        req.flash('error', 'Користувача не знайдено');
        return res.redirect('/login');
    }

    res.render('dashboard', { user });
});

// GET /logout - вихід
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Помилка при виході:', err);
        }
        res.redirect('/login');
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

