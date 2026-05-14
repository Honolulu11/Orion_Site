const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const prisma = new PrismaClient();

// Регистрация
exports.register = async (req, res, next) => {
  try {
    const { email, password, phone, firstName, lastName, userType = 'PRIVATE' } = req.body;

    // Проверка существующего пользователя
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }

    // Хэширование пароля
    const passwordHash = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        phone,
        firstName,
        lastName,
        userType
      },
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    // Генерация токена
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Регистрация успешна',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Вход
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверка пароля
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Генерация токена
    const token = generateToken(user.id);

    // Возвращаем данные (без пароля)
    const userData = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName
    };

    res.json({
      message: 'Вход успешен',
      user: userData,
      token
    });
  } catch (error) {
    next(error);
  }
};

// Получение профиля
exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        userType: true,
        isVerified: true,
        createdAt: true,
        company: true,
        addresses: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            trackingNumber: true,
            fromCity: true,
            toCity: true,
            status: true,
            price: true,
            createdAt: true
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};