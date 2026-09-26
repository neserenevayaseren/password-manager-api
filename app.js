const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware для чтения JSON в теле запросов
app.use(express.json());

// Подключаем маршруты
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/auth', authRoutes);
app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('Password Manager API is running...');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});