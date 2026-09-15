const express = require('express');
const app = express();
const { sequelize, Password } = require('./models');

app.use(express.json());

// GET /passwords — Получить все записи
app.get('/passwords', async (req, res) => {
  try {
    const items = await Password.findAll();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /passwords/:id — Получить запись по ID
app.get('/passwords/:id', async (req, res) => {
  try {
    const item = await Password.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Запись не найдена' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /passwords — Создать запись
app.post('/passwords', async (req, res) => {
  try {
    const newItem = await Password.create(req.body);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /passwords/:id — Обновить запись
app.put('/passwords/:id', async (req, res) => {
  try {
    const [updated] = await Password.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Запись не найдена' });
    const updatedItem = await Password.findByPk(req.params.id);
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /passwords/:id — Удалить запись
app.delete('/passwords/:id', async (req, res) => {
  try {
    const deleted = await Password.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Запись не найдена' });
    res.json({ message: 'Успешно удалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
sequelize.authenticate().then(() => {
  console.log('БД подключена');
  app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
});