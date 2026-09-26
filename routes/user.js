const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { User } = require('../models');

// Защищенный маршрут получения профиля
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // req.user.id берется из middleware после расшифровки токена
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['passwordHash'] } // Не передаем хеш пароля клиенту!
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      message: 'Доступ к защищенному маршруту разрешен',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;