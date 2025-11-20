const API_BASE = '/api/museums';
let allMuseums = [];
let filteredMuseums = [];

// Завантаження музеїв при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    loadMuseums();
    setupEventListeners();
});

// Налаштування обробників подій
function setupEventListeners() {
    // Обробка форми
    document.getElementById('museumForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('museumId').value;
        if (id) {
            await updateMuseum(id);
        } else {
            await addMuseum();
        }
    });

    // Кнопка скасування
    document.getElementById('cancelBtn').addEventListener('click', () => {
        resetForm();
    });
}

// Завантажити всі музеї
async function loadMuseums() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) {
            throw new Error('Помилка при завантаженні даних');
        }
        allMuseums = await response.json();
        filteredMuseums = allMuseums;
        displayMuseums(filteredMuseums);
    } catch (error) {
        showMessage('Помилка при завантаженні музеїв: ' + error.message, 'error');
        document.getElementById('museumsList').innerHTML = '<p class="empty">Помилка завантаження даних</p>';
    }
}

// Відобразити музеї
function displayMuseums(museums) {
    const museumsList = document.getElementById('museumsList');
    
    if (museums.length === 0) {
        museumsList.innerHTML = '<p class="empty">Немає музеїв</p>';
        return;
    }

    museumsList.innerHTML = museums.map(museum => `
        <div class="museum-card">
            <div class="museum-name">${escapeHtml(museum.name)}</div>
            <div class="museum-country">🌍 ${escapeHtml(museum.country)}</div>
            <div class="museum-actions">
                <button class="btn btn-edit btn-small" onclick="editMuseum(${museum.id})">Редагувати</button>
                <button class="btn btn-delete btn-small" onclick="deleteMuseum(${museum.id})">Видалити</button>
            </div>
        </div>
    `).join('');
}

// Додати новий музей
async function addMuseum() {
    const name = document.getElementById('name').value.trim();
    const country = document.getElementById('country').value.trim();

    if (!name || !country) {
        showMessage('Будь ласка, заповніть всі поля', 'error');
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, country })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Музей додано успішно!', 'success');
            document.getElementById('museumForm').reset();
            loadMuseums();
        } else {
            showMessage('Помилка: ' + (data.error || 'Невідома помилка'), 'error');
        }
    } catch (error) {
        showMessage('Помилка при додаванні музею: ' + error.message, 'error');
    }
}

// Редагувати музей
async function editMuseum(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) {
            throw new Error('Музей не знайдено');
        }
        
        const museum = await response.json();
        
        document.getElementById('museumId').value = museum.id;
        document.getElementById('name').value = museum.name;
        document.getElementById('country').value = museum.country;
        document.getElementById('formTitle').textContent = 'Редагувати музей';
        document.getElementById('submitBtn').textContent = 'Зберегти зміни';
        document.getElementById('cancelBtn').style.display = 'block';
        
        // Прокрутити до форми
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showMessage('Помилка при завантаженні даних музею: ' + error.message, 'error');
    }
}

// Оновити музей
async function updateMuseum(id) {
    const name = document.getElementById('name').value.trim();
    const country = document.getElementById('country').value.trim();

    if (!name || !country) {
        showMessage('Будь ласка, заповніть всі поля', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, country })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Музей оновлено успішно!', 'success');
            resetForm();
            loadMuseums();
        } else {
            showMessage('Помилка: ' + (data.error || 'Невідома помилка'), 'error');
        }
    } catch (error) {
        showMessage('Помилка при оновленні музею: ' + error.message, 'error');
    }
}

// Видалити музей
async function deleteMuseum(id) {
    if (!confirm('Ви впевнені, що хочете видалити цей музей?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Музей видалено!', 'success');
            loadMuseums();
        } else {
            showMessage('Помилка: ' + (data.error || 'Невідома помилка'), 'error');
        }
    } catch (error) {
        showMessage('Помилка при видаленні музею: ' + error.message, 'error');
    }
}

// Фільтрація музеїв за країною
function filterMuseums() {
    const filterValue = document.getElementById('filterCountry').value.trim().toLowerCase();
    
    if (!filterValue) {
        filteredMuseums = allMuseums;
    } else {
        filteredMuseums = allMuseums.filter(museum => 
            museum.country.toLowerCase().includes(filterValue)
        );
    }
    
    displayMuseums(filteredMuseums);
}

// Скинути фільтр
function resetFilter() {
    document.getElementById('filterCountry').value = '';
    filteredMuseums = allMuseums;
    displayMuseums(filteredMuseums);
}

// Скинути форму
function resetForm() {
    document.getElementById('museumForm').reset();
    document.getElementById('museumId').value = '';
    document.getElementById('formTitle').textContent = 'Додати новий музей';
    document.getElementById('submitBtn').textContent = 'Додати';
    document.getElementById('cancelBtn').style.display = 'none';
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

