const express = require('express');
const expensesRouter = require('./routes/expenses');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'requests.log');

// Middleware для парсингу form-data та JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware для логування запитів
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip}\n`;
    
    try {
        fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    } catch (error) {
        console.error('Помилка при логуванні:', error);
    }
    
    next();
});

// Статичні файли
app.use(express.static('public'));

// Маршрути для API
app.use('/api/expenses', expensesRouter);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

