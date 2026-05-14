const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { auth } = require('../middleware/auth');

// Все маршруты защищены middleware auth
// Пользователь должен быть авторизован

// POST /api/orders - Создать новый заказ
router.post('/', auth, orderController.createOrder);

// GET /api/orders - Получить все заказы текущего пользователя
router.get('/', auth, orderController.getUserOrders);

// GET /api/orders/:id - Получить конкретный заказ по ID
router.get('/:id', auth, orderController.getOrderById);

// GET /api/orders/track/:trackingNumber - Отследить по трек-номеру
router.get('/track/:trackingNumber', orderController.getOrderByTracking);

// PUT /api/orders/:id/status - Обновить статус (для админа/менеджера)
router.put('/:id/status', auth, orderController.updateOrderStatus);

module.exports = router;