const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  // Проверяем, передан ли заголовок Authorization и начинается ли он с Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нет доступа. Токен не предоставлен' });
  }

  // Извлекаем сам токен (строка после "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Верифицируем токен с помощью секретного ключа
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Прикрепляем данные пользователя к объекту запроса
    req.user = decoded;
    
    // Передаем управление следующему обработчику маршрута
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Недействительный или просроченный токен' });
  }
};