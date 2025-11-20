const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/museums.json');

// Читання даних з JSON файлу
function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Якщо файл не існує, створюємо порожній масив
            writeData([]);
            return [];
        }
        
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        
        if (!data.trim()) {
            return [];
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error('Помилка при читанні файлу:', error);
        throw new Error('Не вдалося прочитати дані з файлу');
    }
}

// Запис даних у JSON файл
function writeData(data) {
    try {
        // Перевірка існування папки data
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Помилка при записі файлу:', error);
        throw new Error('Не вдалося зберегти дані у файл');
    }
}

// Отримати наступний ID
function getNextId(data) {
    if (data.length === 0) {
        return 1;
    }
    return Math.max(...data.map(item => item.id)) + 1;
}

module.exports = {
    readData,
    writeData,
    getNextId
};

