require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Password = require('./models/Password'); 

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB подключена успешно'))
  .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err.message));

app.get('/api/passwords', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: '^' + search, $options: 'i' } },
          { login: { $regex: '^' + search, $options: 'i' } }
        ]
      };
    }

    const total = await Password.countDocuments(query);

    const items = await Password.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    res.json({
      items,
      total,
      hasMore: offset + limit < total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/passwords', async (req, res) => {
  try {
    const newItem = new Password({
      title: req.body.title,
      login: req.body.login,
      password: req.body.password,
      history: [{ action: 'created' }]
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.put('/api/passwords/:id', async (req, res) => {
  try {
    const updatedItem = await Password.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        $push: { history: { action: 'updated' } }
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/passwords/:id', async (req, res) => {
  try {
    const deleted = await Password.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});