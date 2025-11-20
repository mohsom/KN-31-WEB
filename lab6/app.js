const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');
const LOG_FILE = path.join(__dirname, 'requests.log');

// Middleware для парсингу JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware для логування запитів
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${req.method} ${req.url}\n`;
    fs.appendFileSync(LOG_FILE, logEntry, 'utf8');
    next();
});

// Статичні файли
app.use(express.static('public'));

// Функція для читання завдань з файлу
function readTasks() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        return [];
    }
}

// Функція для збереження завдань у файл
function saveTasks(tasks) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

// GET /api/tasks - отримати всі завдання
app.get('/api/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

// GET /api/tasks/:id - отримати завдання за ID
app.get('/api/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    
    if (!task) {
        return res.status(404).json({ error: 'Завдання не знайдено' });
    }
    
    res.json(task);
});

// POST /api/tasks - додати нове завдання
app.post('/api/tasks', (req, res) => {
    const { title, description } = req.body;
    
    if (!title || !description) {
        return res.status(400).json({ error: 'Потрібно вказати title та description' });
    }
    
    const tasks = readTasks();
    const newTask = {
        id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
        title,
        description,
        status: 'active'
    };
    
    tasks.push(newTask);
    saveTasks(tasks);
    
    res.status(201).json(newTask);
});

// PUT /api/tasks/:id - змінити статус або опис
app.put('/api/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Завдання не знайдено' });
    }
    
    const { title, description, status } = req.body;
    
    if (title) tasks[taskIndex].title = title;
    if (description) tasks[taskIndex].description = description;
    if (status && (status === 'active' || status === 'done')) {
        tasks[taskIndex].status = status;
    }
    
    saveTasks(tasks);
    res.json(tasks[taskIndex]);
});

// DELETE /api/tasks/:id - видалити завдання
app.delete('/api/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Завдання не знайдено' });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    saveTasks(tasks);
    
    res.json({ message: 'Завдання видалено', task: deletedTask });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

