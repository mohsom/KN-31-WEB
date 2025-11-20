const API_BASE = '/api/tasks';
let currentFilter = 'all';

// Завантаження завдань при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
});

// Налаштування обробників подій
function setupEventListeners() {
    // Обробка форми додавання завдання
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addTask();
    });

    // Обробка фільтрів
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            loadTasks();
        });
    });
}

// Завантажити всі завдання
async function loadTasks() {
    try {
        const response = await fetch(API_BASE);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        showMessage('Помилка при завантаженні завдань: ' + error.message, 'error');
    }
}

// Відобразити завдання
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    // Фільтрація завдань
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => t.status === 'active');
    } else if (currentFilter === 'done') {
        filteredTasks = tasks.filter(t => t.status === 'done');
    }

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<p class="empty">Немає завдань</p>';
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-card ${task.status === 'done' ? 'done' : ''}">
            <div class="task-header">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                <span class="task-status ${task.status}">${task.status === 'active' ? 'Активне' : 'Виконане'}</span>
            </div>
            <p class="task-description">${escapeHtml(task.description)}</p>
            <div class="task-actions">
                ${task.status === 'active' 
                    ? `<button class="btn btn-success btn-small" onclick="toggleTask(${task.id})">Позначити виконаним</button>`
                    : `<button class="btn btn-success btn-small" onclick="toggleTask(${task.id})">Позначити активним</button>`
                }
                <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">Видалити</button>
            </div>
        </div>
    `).join('');
}

// Додати нове завдання
async function addTask() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title || !description) {
        showMessage('Будь ласка, заповніть всі поля', 'error');
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            showMessage('Завдання додано успішно!', 'success');
            document.getElementById('taskForm').reset();
            loadTasks();
        } else {
            const error = await response.json();
            showMessage('Помилка: ' + (error.error || 'Невідома помилка'), 'error');
        }
    } catch (error) {
        showMessage('Помилка при додаванні завдання: ' + error.message, 'error');
    }
}

// Змінити статус завдання
async function toggleTask(id) {
    try {
        const taskResponse = await fetch(`${API_BASE}/${id}`);
        const task = await taskResponse.json();
        
        const newStatus = task.status === 'active' ? 'done' : 'active';
        
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showMessage('Статус завдання змінено!', 'success');
            loadTasks();
        } else {
            showMessage('Помилка при зміні статусу', 'error');
        }
    } catch (error) {
        showMessage('Помилка: ' + error.message, 'error');
    }
}

// Видалити завдання
async function deleteTask(id) {
    if (!confirm('Ви впевнені, що хочете видалити це завдання?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Завдання видалено!', 'success');
            loadTasks();
        } else {
            showMessage('Помилка при видаленні завдання', 'error');
        }
    } catch (error) {
        showMessage('Помилка: ' + error.message, 'error');
    }
}

// Показати повідомлення
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.className = 'message';
        messageDiv.style.display = 'none';
    }, 3000);
}

// Екранування HTML для безпеки
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

