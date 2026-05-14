const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== СОЗДАНИЕ ЗАКАЗА =====
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      fromCity,
      fromAddress,
      toCity,
      toAddress,
      weight,
      volume,
      cargoType,
      description,
      price
    } = req.body;

    // Проверка обязательных полей
    if (!fromCity || !toCity || !weight || !price) {
      return res.status(400).json({ 
        error: 'Укажите город отправления, город назначения, вес и цену' 
      });
    }

    // Генерация уникального номера заказа
    const trackingNumber = `ORN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Создание заказа в базе
    const order = await prisma.order.create({
      data: {  // ← ВОТ ЭТОГО НЕ ХВАТАЛО!
        trackingNumber,
        userId,
        fromCity,
        fromAddress: fromAddress || '',
        toCity,
        toAddress: toAddress || '',
        weight: parseFloat(weight),
        volume: volume ? parseFloat(volume) : null,
        cargoType: cargoType || 'standard',
        description: description || '',
        price: parseFloat(price),
        currency: 'RUB',
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Заказ успешно создан',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    next(error);
  }
};

// ===== ПОЛУЧЕНИЕ ВСЕХ ЗАКАЗОВ ПОЛЬЗОВАТЕЛЯ =====
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tracking: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      orders,
      total: orders.length
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    next(error);
  }
};

// ===== ПОЛУЧЕНИЕ ОДНОГО ЗАКАЗА ПО ID =====
exports.getOrderById = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user.id;

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        userId: userId
      },
      include: {
        tracking: {
          orderBy: { timestamp: 'desc' }
        },
        documents: true
      }
    });

    if (!order) {
      return res.status(404).json({ 
        error: 'Заказ не найден' 
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    next(error);
  }
};

// ===== ПОЛУЧЕНИЕ ЗАКАЗА ПО ТРЕК-НОМЕРУ =====
exports.getOrderByTracking = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { trackingNumber },
      include: {
        tracking: {
          orderBy: { timestamp: 'desc' }
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ 
        error: 'Заказ с таким номером не найден' 
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order by tracking error:', error);
    next(error);
  }
};

// ===== ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА =====
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Неверный статус заказа' 
      });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },  // ← И ЗДЕСЬ ТОЖЕ!
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Добавляем запись в историю трекинга
    await prisma.tracking.create({
      data: {  // ← И ЗДЕСЬ!
        orderId,
        status,
        location: 'Система',
        comment: `Статус изменён на ${status}`
      }
    });

    res.json({
      message: 'Статус заказа обновлён',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    next(error);
  }
};