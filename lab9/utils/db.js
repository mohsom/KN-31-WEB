const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../users.json');

// Читання користувачів з JSON файлу
function readUsers() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            writeUsers([]);
            return [];
        }
        
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        
        if (!data.trim()) {
            return [];
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error('Помилка при читанні файлу користувачів:', error);
        return [];
    }
}

// Запис користувачів у JSON файл
function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Помилка при записі файлу користувачів:', error);
        throw new Error('Не вдалося зберегти дані користувачів');
    }
}

module.exports = {
    readUsers,
    writeUsers
};

