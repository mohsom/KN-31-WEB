const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'log.txt');

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

// Створення сервера
const server = http.createServer((req, res) => {
    const url = req.url;

    // Головна сторінка
    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Головна сторінка</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    h1 { color: #333; }
                    p { color: #666; line-height: 1.6; }
                    a {
                        display: inline-block;
                        margin: 10px 10px 10px 0;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    a:hover { background: #0056b3; }
                </style>
            </head>
            <body>
                <h1>Лабораторна робота 4 - Node.js HTTP Server</h1>
                <p>Скальський Володимир</p>
                <p>Вітаємо на головній сторінці!</p>
                <a href="/about">Про нас</a>
                <a href="/time">Поточний час</a>
                <a href="/time/json">Поточний час (JSON)</a>
            </body>
            </html>
        `);
    }
    // Сторінка "Про нас"
    else if (url === '/about') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Про нас</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    h1 { color: #333; }
                    p { color: #666; line-height: 1.6; }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    a:hover { background: #0056b3; }
                </style>
            </head>
            <body>
                <h1>Про нас</h1>
                <p>Це простий HTTP-сервер, створений на Node.js без використання додаткових фреймворків.</p>
                <p>Сервер підтримує маршрутизацію та роботу з файловою системою.</p>
                <a href="/">На головну</a>
            </body>
            </html>
        `);
    }
    // Маршрут /time
    else if (url === '/time') {
        const datetime = getFormattedDateTime();
        logRequest('/time');

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Поточний час</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #f5f5f5;
                        text-align: center;
                    }
                    h1 { color: #333; }
                    .time {
                        font-size: 24px;
                        color: #007bff;
                        margin: 30px 0;
                        padding: 20px;
                        background: white;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                    a:hover { background: #0056b3; }
                </style>
            </head>
            <body>
                <h1>Поточний час</h1>
                <div class="time">${datetime.full}</div>
                <a href="/">На головну</a>
                <a href="/time/json">JSON формат</a>
            </body>
            </html>
        `);
    }
    // Маршрут /time/json
    else if (url === '/time/json') {
        const datetime = getFormattedDateTime();
        logRequest('/time/json');

        const jsonData = {
            date: datetime.date,
            time: datetime.time
        };

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(jsonData, null, 2));
    }
    // Обробка невідомого маршруту
    else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html lang="uk">
            <head>
                <meta charset="UTF-8">
                <title>404 - Сторінка не знайдена</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                        text-align: center;
                    }
                    h1 { color: #dc3545; }
                    a {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h1>404 - Сторінка не знайдена</h1>
                <p>Запитана сторінка не існує.</p>
                <a href="/">На головну</a>
            </body>
            </html>
        `);
    }
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

