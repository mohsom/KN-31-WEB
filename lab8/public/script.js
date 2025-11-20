const API_BASE = '/api/expenses';

// Встановити максимальну дату як сьогодні
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('max', today);
    dateInput.value = today; // Встановити сьогоднішню дату за замовчуванням
    
    loadExpenses();
    setupFormHandler();
});

// Налаштування обробника форми
function setupFormHandler() {
    const form = document.getElementById('expenseForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm();
    });
}

// Відправка форми
async function submitForm() {
    const form = document.getElementById('expenseForm');
    const formData = new FormData(form);
    
    // Очистити попередні помилки
    clearErrors();
    hideMessage();
    
    // Показати завантаження
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Обробка...';
    
    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showMessage('Витрату додано успішно!', 'success');
            form.reset();
            // Встановити дату на сьогодні
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('date').value = today;
            loadExpenses();
        } else {
            // Показати помилки валідації
            if (data.errors && Array.isArray(data.errors)) {
                displayValidationErrors(data.errors);
            } else {
                showMessage('Помилка при додаванні витрати: ' + (data.error || 'Невідома помилка'), 'error');
            }
        }
    } catch (error) {
        showMessage('Помилка при відправці форми: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Додати витрату';
    }
}

// Відображення помилок валідації
function displayValidationErrors(errors) {
    errors.forEach(error => {
        const field = error.path || error.param;
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = error.msg || error.message;
            const inputElement = document.getElementById(field);
            if (inputElement) {
                inputElement.classList.add('error');
            }
        }
    });
    
    // Показати загальне повідомлення про помилки
    if (errors.length > 0) {
        showMessage('Будь ласка, виправте помилки у формі', 'error');
    }
}

// Очистити помилки
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
}

// Завантажити всі витрати
async function loadExpenses() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Помилка при завантаженні даних');
        }
        const expenses = await response.json();
        displayExpenses(expenses);
    } catch (error) {
        showMessage('Помилка при завантаженні витрат: ' + error.message, 'error');
        document.getElementById('expensesList').innerHTML = '<p class="empty">Помилка завантаження даних</p>';
    }
}

// Відобразити витрати
function displayExpenses(expenses) {
    const expensesList = document.getElementById('expensesList');
    
    if (expenses.length === 0) {
        expensesList.innerHTML = '<p class="empty">Немає витрат</p>';
        return;
    }
    
    // Підрахунок загальної суми
    const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Форматування дати
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    
    expensesList.innerHTML = `
        <div class="summary">
            <div class="summary-title">Загальна сума витрат</div>
            <div class="summary-amount">${total.toFixed(2)} грн</div>
        </div>
        ${expenses.reverse().map(expense => `
            <div class="expense-card">
                <div class="expense-header">
                    <div class="expense-description">${escapeHtml(expense.description)}</div>
                    <div class="expense-amount">${parseFloat(expense.amount).toFixed(2)} грн</div>
                </div>
                <div class="expense-details">
                    <span class="expense-category">${escapeHtml(expense.category)}</span>
                    <span>📅 ${formatDate(expense.date)}</span>
                </div>
            </div>
        `).join('')}
    `;
}

// Показати повідомлення
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.className = 'message';
        messageDiv.style.display = 'none';
    }, 5000);
}

// Приховати повідомлення
function hideMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.className = 'message';
    messageDiv.style.display = 'none';
}

// Екранування HTML для безпеки
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

