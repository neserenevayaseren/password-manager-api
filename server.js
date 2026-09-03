const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let passwords = [
  {
    id: 1,
    title: 'Основная почта Google',
    serviceUrl: 'https://gmail.com',
    login: 'user@gmail.com',
    encryptedPassword: 'U2FsdGVkX1+vG8mX9zA...', 
    category: 'Личное',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Корпоративный GitHub',
    serviceUrl: 'https://github.com',
    login: 'dev_dasha',
    encryptedPassword: 'U2FsdGVkX18aB9mK1xL...',
    category: 'Работа',
    createdAt: '2026-09-01T11:30:00.000Z'
  }
];

function generateSecurePassword(length = 16, includeSymbols = true) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const validChars = includeSymbols ? chars + symbols : chars;
  
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * validChars.length);
    result += validChars[randomIndex];
  }
  return result;
}


app.get('/passwords', (req, res) => {
  const { category } = req.query;

  if (category) {
    const filtered = passwords.filter(
      item => item.category.toLowerCase() === category.toLowerCase()
    );
    return res.status(200).json(filtered);
  }

  res.status(200).json(passwords);
});

app.get('/passwords/generate', (req, res) => {
  const length = parseInt(req.query.length) || 16;
  const includeSymbols = req.query.symbols !== 'false';

  if (length < 4 || length > 128) {
    return res.status(400).json({
      error: 'Ошибка валидации',
      message: 'Длина пароля должна быть от 4 до 128 символов.'
    });
  }

  const generatedPassword = generateSecurePassword(length, includeSymbols);
  
  res.status(200).json({
    length,
    includeSymbols,
    generatedPassword
  });
});

app.get('/passwords/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const record = passwords.find(item => item.id === id);

  if (!record) {
    return res.status(404).json({
      error: 'Запись не найдена',
      message: `Запись хранилища с ID ${id} отсутствует.`
    });
  }

  res.status(200).json(record);
});

app.post('/passwords', (req, res) => {
  const { title, serviceUrl, login, encryptedPassword, category } = req.body;

  if (!title || !login || !encryptedPassword) {
    return res.status(400).json({
      error: 'Ошибка валидации',
      message: 'Поля "title", "login" и "encryptedPassword" обязательны для заполнения.'
    });
  }

  const newRecord = {
    id: passwords.length > 0 ? Math.max(...passwords.map(p => p.id)) + 1 : 1,
    title,
    serviceUrl: serviceUrl || '',
    login,
    encryptedPassword,
    category: category || 'Общее',
    createdAt: new Date().toISOString()
  };

  passwords.push(newRecord);
  res.status(201).json(newRecord);
});

app.put('/passwords/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = passwords.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: 'Запись не найдена',
      message: `Невозможно обновить: запись с ID ${id} не найдена.`
    });
  }

  const { title, serviceUrl, login, encryptedPassword, category } = req.body;

  if (!title || !login || !encryptedPassword) {
    return res.status(400).json({
      error: 'Ошибка валидации',
      message: 'Поля "title", "login" и "encryptedPassword" обязательны для обновления.'
    });
  }

  passwords[index] = {
    ...passwords[index],
    title,
    serviceUrl: serviceUrl !== undefined ? serviceUrl : passwords[index].serviceUrl,
    login,
    encryptedPassword,
    category: category || passwords[index].category,
    updatedAt: new Date().toISOString()
  };

  res.status(200).json(passwords[index]);
});

app.delete('/passwords/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = passwords.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: 'Запись не найдена',
      message: `Невозможно удалить: запись с ID ${id} не найдена.`
    });
  }

  const deletedRecord = passwords.splice(index, 1)[0];
  res.status(200).json({
    message: 'Запись успешно удалена из хранилища',
    deletedRecord
  });
});


app.use((req, res, next) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    message: `Запрошенный путь ${req.originalUrl} не существует.`
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: err.message || 'Произошла непредвиденная ошибка.'
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен и слушает порт ${PORT}`);
});