// Обробка форми для збереження дати та часу
document.getElementById('timeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const date = formData.get('date');
    const time = formData.get('time');
    
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'none';
    
    try {
        const response = await fetch('/settime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, time })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageDiv.textContent = data.message || 'Дата та час збережено успішно!';
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            e.target.reset();
        } else {
            messageDiv.textContent = data.error || 'Помилка при збереженні';
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
    } catch (error) {
        messageDiv.textContent = 'Помилка при відправці запиту: ' + error.message;
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
    }
});

// Обробка кліку на посилання JSON
document.getElementById('jsonLink').addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/time/json');
        const data = await response.json();
        
        alert(`Дата: ${data.date}\nЧас: ${data.time}`);
    } catch (error) {
        alert('Помилка при отриманні даних: ' + error.message);
    }
});

