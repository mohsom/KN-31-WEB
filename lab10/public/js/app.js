const API_BASE = '/api';
let currentUser = null;
let currentFilter = 'all';
let chart = null;

// Ініціалізація залежно від сторінки
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    
    if (path.includes('register.html')) {
        initRegister();
    } else if (path.includes('login.html')) {
        initLogin();
    } else if (path.includes('dashboard.html')) {
        initDashboard();
    }
});

// Реєстрація
function initRegister() {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await register();
    });
}

async function register() {
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    
    const data = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('Реєстрація успішна! Перенаправлення...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            const errorMsg = result.errors ? result.errors.map(e => e.msg).join(', ') : result.error || 'Помилка реєстрації';
            showMessage(errorMsg, 'error');
        }
    } catch (error) {
        showMessage('Помилка при відправці запиту: ' + error.message, 'error');
    }
}

// Вхід
function initLogin() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await login();
    });
}

async function login() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showMessage('Вітаємо! Перенаправлення...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(result.error || 'Помилка входу', 'error');
        }
    } catch (error) {
        showMessage('Помилка при відправці запиту: ' + error.message, 'error');
    }
}

// Dashboard
async function initDashboard() {
    // Перевірка авторизації
    await checkAuth();
    
    // Налаштування подій
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('taskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await addTask();
    });
    
    // Фільтри
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            loadTasks();
        });
    });
    
    // Завантаження даних
    await loadTasks();
}

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/me`);
        
        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }
        
        const result = await response.json();
        currentUser = result.user;
        document.getElementById('userName').textContent = currentUser.fullName;
    } catch (error) {
        window.location.href = 'login.html';
    }
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            throw new Error('Помилка завантаження');
        }
        
        let tasks = await response.json();
        
        // Фільтрація
        if (currentFilter === 'active') {
            tasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            tasks = tasks.filter(t => t.completed);
        }
        
        displayTasks(tasks);
        updateChart(tasks);
    } catch (error) {
        document.getElementById('tasksList').innerHTML = '<p class="empty">Помилка завантаження завдань</p>';
    }
}

function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p class="empty">Немає завдань</p>';
        return;
    }
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <span class="task-priority ${task.priority}">${task.priority}</span>
            </div>
            <div class="task-actions">
                <button class="btn btn-success" onclick="toggleTask(${task.id}, ${!task.completed})">
                    ${task.completed ? 'Позначити невиконаним' : 'Позначити виконаним'}
                </button>
                <button class="btn btn-edit" onclick="editTask(${task.id}, '${escapeHtml(task.title)}', '${task.priority}')">Редагувати</button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">Видалити</button>
            </div>
        </div>
    `).join('');
}

async function addTask() {
    const form = document.getElementById('taskForm');
    const formData = new FormData(form);
    
    const data = {
        title: formData.get('title'),
        priority: formData.get('priority')
    };
    
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            form.reset();
            loadTasks();
        } else {
            const result = await response.json();
            alert('Помилка: ' + (result.error || 'Невідома помилка'));
        }
    } catch (error) {
        alert('Помилка: ' + error.message);
    }
}

async function toggleTask(id, completed) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        alert('Помилка: ' + error.message);
    }
}

function editTask(id, currentTitle, currentPriority) {
    const newTitle = prompt('Введіть нову назву:', currentTitle);
    if (newTitle === null) return;
    
    const newPriority = prompt('Введіть пріоритет (низька/середня/висока):', currentPriority);
    if (newPriority === null) return;
    
    if (!['низька', 'середня', 'висока'].includes(newPriority)) {
        alert('Невірний пріоритет!');
        return;
    }
    
    updateTask(id, newTitle, newPriority);
}

async function updateTask(id, title, priority) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, priority })
        });
        
        if (response.ok) {
            loadTasks();
        } else {
            const result = await response.json();
            alert('Помилка: ' + (result.error || 'Невідома помилка'));
        }
    } catch (error) {
        alert('Помилка: ' + error.message);
    }
}

async function deleteTask(id) {
    if (!confirm('Ви впевнені, що хочете видалити це завдання?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        alert('Помилка: ' + error.message);
    }
}

function updateChart(tasks) {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const notCompleted = total - completed;
    
    const ctx = document.getElementById('statsChart');
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Виконано', 'Не виконано'],
            datasets: [{
                data: [completed, notCompleted],
                backgroundColor: ['#4CAF50', '#F44336'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

async function logout() {
    try {
        await fetch(`${API_BASE}/logout`);
        window.location.href = 'login.html';
    } catch (error) {
        window.location.href = 'login.html';
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.className = 'message';
        messageDiv.style.display = 'none';
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

