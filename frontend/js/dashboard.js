// js/dashboard.js

// 1. Проверка авторизации
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = 'login.html';
}

// 2. Приветствие
const userNameEl = document.getElementById('userName');
if (userNameEl && user) {
  userNameEl.textContent = user.firstName || 'Пользователь';
}

// 3. Загрузка реальных заказов
const ordersList = document.getElementById('ordersList');

async function loadOrders() {
  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.status === 401) {
      // Токен протух или неверен
      localStorage.clear();
      window.location.href = 'login.html';
      return;
    }

    const data = await response.json();
    renderOrders(data.orders || []);
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error);
    ordersList.innerHTML = `<div class="orders-empty"><p>Не удалось загрузить заказы. Проверьте подключение.</p></div>`;
  }
}

// 4. Отрисовка заказов
function renderOrders(orders) {
  if (!orders.length) {
    ordersList.innerHTML = `
      <div class="orders-empty">
        <i class="fas fa-box-open"></i>
        <p>У вас пока нет заказов</p>
        <a href="calculator.html" class="btn btn--primary" style="margin-top: 20px;">
          Оформить первый заказ
        </a>
      </div>
    `;
    updateStats([]);
    return;
  }

  const statusMap = {
    PENDING: { label: 'Ожидает', class: 'status-pending' },
    CONFIRMED: { label: 'Подтверждён', class: 'status-confirmed' },
    IN_TRANSIT: { label: 'В пути', class: 'status-in_transit' },
    DELIVERED: { label: 'Доставлен', class: 'status-delivered' },
    CANCELLED: { label: 'Отменён', class: 'status-cancelled' }
  };

  ordersList.innerHTML = orders.map(order => {
    const status = statusMap[order.status] || { label: order.status, class: 'status-pending' };
    return `
      <div class="order-card">
        <div class="order-card__info">
          <h3>Заказ №${order.trackingNumber}</h3>
          <div class="order-card__route">
            <i class="fas fa-route"></i> ${order.fromCity} → ${order.toCity}
          </div>
          <div class="order-card__meta">
            <span><i class="far fa-calendar"></i> ${new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
            <span><i class="fas fa-weight-hanging"></i> ${order.weight} кг</span>
          </div>
        </div>
        <div>
          <div class="order-card__status ${status.class}">${status.label}</div>
          <div class="order-card__price">
            ${order.price.toLocaleString('ru-RU')} ₽
            <span>стоимость</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  updateStats(orders);
}

// 5. Обновление статистики
function updateStats(orders) {
  const total = orders.length;
  const active = orders.filter(o => ['PENDING', 'CONFIRMED', 'IN_TRANSIT'].includes(o.status)).length;
  const delivered = orders.filter(o => o.status === 'DELIVERED').length;

  document.getElementById('totalOrders').textContent = total;
  document.getElementById('activeOrders').textContent = active;
  document.getElementById('deliveredOrders').textContent = delivered;
}

// Запуск при загрузке страницы
loadOrders();