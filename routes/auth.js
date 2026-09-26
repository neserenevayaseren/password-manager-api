const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models'); // Подключаем модель Sequelize
const authMiddleware = require('../middleware/auth'); // Подключаем middleware проверки токена

// 1. РЕГИСТРАЦИЯ
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль (мастер-пароль) с солью (срок сложности 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Сохраняем пользователя в БД
    const newUser = await User.create({ email, passwordHash });

    res.status(201).json({ 
      message: 'Регистрация прошла успешно', 
      userId: newUser.id,
      email: newUser.email 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// 2. ВХОД (LOGIN)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ищем пользователя по email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Сравниваем введенный пароль с хешем из базы данных
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерируем JWT токен (срок жизни 1 час)
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.json({ message: 'Успешный вход', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// 3. ДОПОЛНИТЕЛЬНЫЙ МЕХАНИЗМ: Смена пароля (Требует авторизации)
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Получаем ID из расшифрованного токена

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Проверяем старый пароль
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Неверный старый пароль' });
    }

    // Хешируем новый пароль и сохраняем
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при смене пароля' });
  }
});

module.exports = router;