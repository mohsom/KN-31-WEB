const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'log.txt');
const CUSTOM_FILE = path.join(__dirname, 'custom.txt');

// Middleware для парсингу JSON та URL-encoded даних
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статичні файли з папки public
app.use(express.static('public'));

// Функція для форматування дати та часу
function getFormattedDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return {
        date: `${day}.${month}.${year}`,
        time: `${hours}:${minutes}:${seconds}`,
        full: `Поточний час: ${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`
    };
}

// Функція для логування запитів
function logRequest(route) {
    const datetime = getFormattedDateTime();
    const logEntry = `[${datetime.date} ${datetime.time}] Запит на маршрут: ${route}\n`;
    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
}

// Маршрут /time
app.get('/time', (req, res) => {
    logRequest('/time');
    const datetime = getFormattedDateTime();
    res.send(`<h1>${datetime.full}</h1><p><a href="/">На головну</a> | <a href="/time/json">JSON формат</a></p>`);
});

// Маршрут /time/json
app.get('/time/json', (req, res) => {
    logRequest('/time/json');
    const datetime = getFormattedDateTime();
    res.json({
        date: datetime.date,
        time: datetime.time
    });
});

// Маршрут /settime (POST) для збереження дати та часу
app.post('/settime', (req, res) => {
    const { date, time } = req.body;
    
    if (!date || !time) {
        return res.status(400).json({ error: 'Потрібно вказати дату та час' });
    }
    
    const entry = `Дата: ${date}, Час: ${time}\n`;
    fs.appendFileSync(CUSTOM_FILE, entry, 'utf8');
    
    res.json({ success: true, message: 'Дата та час збережено успішно!' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер Express запущено на http://localhost:${PORT}`);
});

