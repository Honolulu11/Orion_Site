const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const auth = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const token = authHeader.split(' ')[1];
    
    // Верификация
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Поиск пользователя
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный токен' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Токен истёк' });
    }
    res.status(500).json({ error: 'Ошибка авторизации' });
  }
};

// Проверка роли (для B2B функций)
const requireBusiness = (req, res, next) => {
  if (req.user?.userType !== 'BUSINESS') {
    return res.status(403).json({ error: 'Доступно только для бизнес-аккаунтов' });
  }
  next();
};

module.exports = { auth, requireBusiness };