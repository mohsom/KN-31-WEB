const express = require('express');
const router = express.Router();
const { readData, writeData, getNextId } = require('../utils/fileHandler');

// GET /api/museums - отримати всі музеї
router.get('/', (req, res) => {
    try {
        const museums = readData();
        res.json(museums);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/museums/:id - отримати музей за ID
router.get('/:id', (req, res) => {
    try {
        const museums = readData();
        const museum = museums.find(m => m.id === parseInt(req.params.id));
        
        if (!museum) {
            return res.status(404).json({ error: 'Музей не знайдено' });
        }
        
        res.json(museum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/museums - додати новий музей
router.post('/', (req, res) => {
    try {
        const { name, country } = req.body;
        
        if (!name || !country) {
            return res.status(400).json({ error: 'Потрібно вказати name та country' });
        }
        
        const museums = readData();
        const newMuseum = {
            id: getNextId(museums),
            name: name.trim(),
            country: country.trim()
        };
        
        museums.push(newMuseum);
        writeData(museums);
        
        res.status(201).json(newMuseum);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/museums/:id - оновити музей
router.put('/:id', (req, res) => {
    try {
        const museums = readData();
        const museumIndex = museums.findIndex(m => m.id === parseInt(req.params.id));
        
        if (museumIndex === -1) {
            return res.status(404).json({ error: 'Музей не знайдено' });
        }
        
        const { name, country } = req.body;
        
        if (name) museums[museumIndex].name = name.trim();
        if (country) museums[museumIndex].country = country.trim();
        
        writeData(museums);
        res.json(museums[museumIndex]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/museums/:id - видалити музей
router.delete('/:id', (req, res) => {
    try {
        const museums = readData();
        const museumIndex = museums.findIndex(m => m.id === parseInt(req.params.id));
        
        if (museumIndex === -1) {
            return res.status(404).json({ error: 'Музей не знайдено' });
        }
        
        const deletedMuseum = museums.splice(museumIndex, 1)[0];
        writeData(museums);
        
        res.json({ message: 'Музей видалено', museum: deletedMuseum });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

