const express = require('express');
const museumsRouter = require('./routes/museums');

const app = express();
const PORT = 3000;

// Middleware для парсингу JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статичні файли
app.use(express.static('public'));

// Маршрути для API
app.use('/api/museums', museumsRouter);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

