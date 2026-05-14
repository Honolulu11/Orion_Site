document.addEventListener('DOMContentLoaded', () => {
  const calcBtn = document.getElementById('calcBtn');
  const orderBtn = document.getElementById('orderBtn');
  const resultBlock = document.getElementById('resultBlock');
  const resultPrice = document.getElementById('resultPrice');
  
  let calculatedPrice = 0;

  // 1. Логика расчёта
  calcBtn.addEventListener('click', () => {
    const fromCity = document.getElementById('fromCity').value;
    const toCity = document.getElementById('toCity').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const cargoType = document.getElementById('cargoType').value;

    if (!fromCity || !toCity || !weight) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    // Формула (упрощённая для диплома):
    // Базовая цена = Расстояние (рандом 500-1000км) * 15 руб * Вес * Коэффициент
    const mockDistance = Math.floor(Math.random() * (1000 - 500 + 1)) + 500; 
    const coefficients = { standard: 1.0, fragile: 1.3, heavy: 1.2, perishable: 1.5 };
    
    // Пример: 20 руб за 1 тонно-километр
    const price = Math.round(mockDistance * (weight / 1000) * 20 * coefficients[cargoType]);
    
    calculatedPrice = price > 5000 ? price : 5000; // Минималка 5000р

    resultPrice.textContent = calculatedPrice.toLocaleString('ru-RU') + ' ₽';
    
    // Показываем результат и кнопку оформления
    resultBlock.classList.remove('hidden');
    calcBtn.classList.add('hidden');
    orderBtn.classList.remove('hidden');
  });

  // 2. Отправка заказа на бэкенд
  const form = document.getElementById('calcForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для оформления заказа нужно войти в систему!');
      window.location.href = 'login.html';
      return;
    }

    orderBtn.textContent = 'Оформляем...';
    orderBtn.disabled = true;

    const data = {
      fromCity: document.getElementById('fromCity').value,
      toCity: document.getElementById('toCity').value,
      weight: parseFloat(document.getElementById('weight').value),
      cargoType: document.getElementById('cargoType').value,
      price: calculatedPrice,
      description: `Заказ через калькулятор (${document.getElementById('cargoType').value})`
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ Заказ успешно создан!');
        window.location.href = 'dashboard.html'; // Переход в кабинет
      } else {
        alert('❌ Ошибка: ' + (result.error || 'Не удалось создать заказ'));
        orderBtn.textContent = 'Оформить заказ';
        orderBtn.disabled = false;
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка сети. Убедитесь, что сервер запущен.');
      orderBtn.textContent = 'Оформить заказ';
      orderBtn.disabled = false;
    }
  });
});