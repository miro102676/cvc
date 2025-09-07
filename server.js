const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Хранение данных
const DATA_FILE = path.join(__dirname, 'data', 'applications.json');

// Убедимся, что папка data существует
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Функция для чтения данных
function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Error reading data:', error);
    }
    return [];
}

// Функция для записи данных
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// Маршрут для сохранения анкеты
app.post('/api/save-application', (req, res) => {
    const applicationData = req.body;
    
    if (!applicationData) {
        return res.status(400).json({ error: 'No data provided' });
    }
    
    // Добавляем timestamp
    applicationData.timestamp = new Date().toISOString();
    applicationData.id = Date.now();
    
    // Читаем существующие данные
    const applications = readData();
    
    // Добавляем новую заявку
    applications.push(applicationData);
    
    // Сохраняем данные
    if (writeData(applications)) {
        res.json({ success: true, id: applicationData.id });
    } else {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Маршрут для получения всех анкет
app.get('/api/get-applications', (req, res) => {
    const applications = readData();
    res.json(applications);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});