const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { read, write } = require('./utils/db');

const app = express();
const PORT = 3000;

// Middleware для парсингу даних
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Налаштування сесій
app.use(session({
    secret: 'lab10-todo-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 години
    }
}));

// Flash messages
app.use(flash());

// Middleware для передачі flash messages
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Статичні файли
app.use(express.static('public'));

// Middleware для перевірки авторизації
const isAuthenticated = (req, res, next) => {
    if (req.session?.userId) {
        return next();
    }
    res.status(401).json({ error: 'Необхідна авторизація', redirect: '/login.html' });
};

// Валідація реєстрації
const validateRegister = [
    body('fullName')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('ПІБ має бути від 3 до 50 символів'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Невірний формат email')
        .normalizeEmail()
        .custom((value) => {
            const users = read('users.json');
            if (users.find(u => u.email.toLowerCase() === value.toLowerCase())) {
                throw new Error('Користувач з таким email вже існує');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Пароль має бути мінімум 6 символів')
];

// Валідація входу
const validateLogin = [
    body('email').trim().isEmail().withMessage('Невірний формат email').normalizeEmail(),
    body('password').notEmpty().withMessage('Пароль обов\'язковий')
];

// Валідація завдання
const validateTask = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Назва завдання має бути від 1 до 100 символів'),
    body('priority')
        .optional()
        .isIn(['низька', 'середня', 'висока'])
        .withMessage('Пріоритет має бути: низька, середня або висока')
];

// POST /api/register - реєстрація
app.post('/api/register', validateRegister, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { fullName, email, password } = req.body;
        const users = read('users.json');
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        write('users.json', users);
        
        req.session.userId = newUser.id;
        req.session.userName = newUser.fullName;
        
        res.json({ success: true, message: 'Реєстрація успішна!', user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email } });
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        res.status(500).json({ error: 'Помилка при реєстрації' });
    }
});

// POST /api/login - вхід
app.post('/api/login', validateLogin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        const users = read('users.json');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            return res.status(401).json({ error: 'Користувач з таким email не знайдено' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Невірний пароль' });
        }
        
        req.session.userId = user.id;
        req.session.userName = user.fullName;
        
        res.json({ success: true, message: 'Вітаємо! Ви успішно увійшли в систему.', user: { id: user.id, fullName: user.fullName, email: user.email } });
    } catch (error) {
        console.error('Помилка при вході:', error);
        res.status(500).json({ error: 'Помилка при вході' });
    }
});

// GET /api/logout - вихід
app.get('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Помилка при виході:', err);
            return res.status(500).json({ error: 'Помилка при виході' });
        }
        res.json({ success: true, message: 'Ви успішно вийшли з системи' });
    });
});

// GET /api/me - інформація про поточного користувача
app.get('/api/me', isAuthenticated, (req, res) => {
    const users = read('users.json');
    const user = users.find(u => u.id === req.session.userId);
    
    if (!user) {
        req.session.destroy();
        return res.status(401).json({ error: 'Користувача не знайдено', redirect: '/login.html' });
    }
    
    res.json({ user: { id: user.id, fullName: user.fullName, email: user.email } });
});

// GET /api/tasks - отримати всі завдання користувача
app.get('/api/tasks', isAuthenticated, (req, res) => {
    try {
        const tasks = read('tasks.json');
        const userTasks = tasks.filter(t => t.userId === req.session.userId);
        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: 'Помилка при отриманні завдань' });
    }
});

// POST /api/tasks - створити завдання
app.post('/api/tasks', isAuthenticated, validateTask, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, priority } = req.body;
        const tasks = read('tasks.json');
        
        const newTask = {
            id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
            userId: req.session.userId,
            title: title.trim(),
            completed: false,
            priority: priority || 'середня',
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        write('tasks.json', tasks);
        
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Помилка при створенні завдання:', error);
        res.status(500).json({ error: 'Помилка при створенні завдання' });
    }
});

// PUT /api/tasks/:id - оновити завдання
app.put('/api/tasks/:id', isAuthenticated, validateTask, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const tasks = read('tasks.json');
        const taskId = parseInt(req.params.id);
        const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.session.userId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Завдання не знайдено або немає доступу' });
        }
        
        const { title, completed, priority } = req.body;
        
        if (title !== undefined) tasks[taskIndex].title = title.trim();
        if (completed !== undefined) tasks[taskIndex].completed = completed;
        if (priority !== undefined) tasks[taskIndex].priority = priority;
        
        write('tasks.json', tasks);
        res.json({ success: true, task: tasks[taskIndex] });
    } catch (error) {
        console.error('Помилка при оновленні завдання:', error);
        res.status(500).json({ error: 'Помилка при оновленні завдання' });
    }
});

// DELETE /api/tasks/:id - видалити завдання
app.delete('/api/tasks/:id', isAuthenticated, (req, res) => {
    try {
        const tasks = read('tasks.json');
        const taskId = parseInt(req.params.id);
        const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.session.userId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Завдання не знайдено або немає доступу' });
        }
        
        const deletedTask = tasks.splice(taskIndex, 1)[0];
        write('tasks.json', tasks);
        
        res.json({ success: true, message: 'Завдання видалено', task: deletedTask });
    } catch (error) {
        console.error('Помилка при видаленні завдання:', error);
        res.status(500).json({ error: 'Помилка при видаленні завдання' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

