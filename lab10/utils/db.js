const fs = require('fs');
const path = require('path');

// Читання даних з JSON файлу
function read(fileName) {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        
        if (!fs.existsSync(filePath)) {
            write(fileName, []);
            return [];
        }
        
        const data = fs.readFileSync(filePath, 'utf8');
        
        if (!data.trim()) {
            return [];
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error(`Помилка при читанні файлу ${fileName}:`, error);
        return [];
    }
}

// Запис даних у JSON файл
function write(fileName, data) {
    try {
        const filePath = path.join(__dirname, '../data', fileName);
        const dataDir = path.dirname(filePath);
        
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Помилка при записі файлу ${fileName}:`, error);
        throw new Error(`Не вдалося зберегти дані у файл ${fileName}`);
    }
}

module.exports = {
    read,
    write
};

