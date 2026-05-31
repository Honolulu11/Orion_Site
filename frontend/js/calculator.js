document.addEventListener('DOMContentLoaded', () => {
  // ===== КОНФИГУРАЦИЯ =====
  const API_BASE = 'http://localhost:5000/api';
  const YANDEX_API_KEY = '2c193b4d-c134-45f1-9987-50dc3b4ca4b2'; // Твой ключ JS API / Геокодера
  
  // Коэффициенты для типов груза
  const CARGO_COEFFICIENTS = {
    'standard': 1.0,   // Стандартный
    'fragile': 1.3,    // Хрупкий
    'heavy': 1.2,      // Тяжеловесный
    'perishable': 1.5  // Скоропортящийся
  };

  const BASE_RATE_PER_TON_KM = 18; // Базовая ставка: 18 руб за 1 тонно-километр
  const MIN_WEIGHT_KG = 400;       // Минимальный вес
  const MIN_ORDER_PRICE = 5000;    // Минимальная стоимость заказа

  // ===== ЭЛЕМЕНТЫ DOM =====
  const form = document.getElementById('calcForm');
  const calcBtn = document.getElementById('calcBtn');
  const orderBtn = document.getElementById('orderBtn');
  const resultBlock = document.getElementById('resultBlock');
  const resultPrice = document.getElementById('resultPrice');
  const resultDistance = document.getElementById('resultDistance');

  const inputFrom = document.getElementById('fromCity');
  const inputTo = document.getElementById('toCity');
  const inputWeight = document.getElementById('weight');
  const inputType = document.getElementById('cargoType');

  // Переменная для хранения рассчитанной цены
  let calculatedPrice = 0;
  let calculatedDistance = 0;

  // ===== ФУНКЦИИ =====

  // 1. Получение координат города через Яндекс Геокодер
  async function getCoordinates(city) {
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(city)}&format=json`
      );
      const data = await response.json();
      const feature = data.response.GeoObjectCollection.featureMember[0];
      
      if (feature) {
        const pos = feature.GeoObject.Point.pos.split(' ');
        return { lat: parseFloat(pos[1]), lon: parseFloat(pos[0]) };
      } else {
        throw new Error('Город не найден');
      }
    } catch (error) {
      console.error(`Ошибка поиска координат для "${city}":`, error);
      throw error;
    }
  }

  // 2. Расчет расстояния (Прямое расстояние * 1.3 погрешность дорог)
  function calculateRoadDistance(coords1, coords2) {
    // Формула Haversine для расчета расстояния между точками на сфере
    const R = 6371; // Радиус Земли в км
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const directDistance = R * c;

    // Множитель 1.3 учитывает, что дороги не прямые
    return Math.round(directDistance * 1.3); 
  }

  // 3. Основная логика расчета
  async function handleCalculation() {
    const fromCity = inputFrom.value.trim();
    const toCity = inputTo.value.trim();
    const weight = parseFloat(inputWeight.value);
    const cargoType = inputType.value; // Получаем value из select (standard, fragile и т.д.)

    // Валидация
    if (!fromCity || !toCity) {
      alert('Пожалуйста, укажите города отправления и назначения!');
      return;
    }

    if (!weight || weight < MIN_WEIGHT_KG) {
      alert(`Минимальный вес груза для расчета — ${MIN_WEIGHT_KG} кг.`);
      inputWeight.focus();
      return;
    }

    // UI: Показываем загрузку
    calcBtn.textContent = 'Считаем...';
    calcBtn.disabled = true;

    try {
      // Получаем координаты обоих городов
      const [coordsFrom, coordsTo] = await Promise.all([
        getCoordinates(fromCity),
        getCoordinates(toCity)
      ]);

      // Считаем расстояние
      calculatedDistance = calculateRoadDistance(coordsFrom, coordsTo);

      // Считаем цену
      const weightInTons = weight / 1000;
      const coefficient = CARGO_COEFFICIENTS[cargoType] || 1.0;
      
      // Формула: Расстояние * Вес(т) * Ставка * Коэф
      let price = calculatedDistance * weightInTons * BASE_RATE_PER_TON_KM * coefficient;

      // Применяем минимальную стоимость
      calculatedPrice = price < MIN_ORDER_PRICE ? MIN_ORDER_PRICE : Math.round(price);

      // Обновляем UI
      resultDistance.innerHTML = `<i class="fas fa-route"></i> Расстояние: ~${calculatedDistance} км`;
      resultPrice.textContent = `${calculatedPrice.toLocaleString()} ₽`;
      
      resultBlock.style.display = 'block'; // Показываем блок с результатом
      calcBtn.style.display = 'none';      // Скрываем кнопку "Рассчитать"
      orderBtn.style.display = 'block';    // Показываем кнопку "Оформить"

    } catch (error) {
      alert('Не удалось рассчитать стоимость. Проверьте названия городов или подключение к интернету.');
      console.error(error);
    } finally {
      calcBtn.textContent = 'Рассчитать стоимость';
      calcBtn.disabled = false;
    }
  }

  // 4. Отправка заказа на сервер
  async function handleOrderSubmission() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Для оформления заказа необходимо войти в личный кабинет!');
      window.location.href = 'login.html';
      return;
    }

    orderBtn.textContent = 'Оформляем...';
    orderBtn.disabled = true;

    const orderData = {
      fromCity: inputFrom.value.trim(),
      toCity: inputTo.value.trim(),
      weight: parseFloat(inputWeight.value),
      cargoType: inputType.value,
      price: calculatedPrice,
      description: `Заказ через калькулятор (расстояние ${calculatedDistance} км)`
    };

    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert('✅ Заказ успешно создан! Переход в личный кабинет...');
        window.location.href = 'dashboard.html';
      } else {
        const errorData = await response.json();
        alert(`❌ Ошибка: ${errorData.error || 'Не удалось создать заказ'}`);
        orderBtn.disabled = false;
        orderBtn.textContent = 'Оформить заказ';
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
      alert('Ошибка сети. Убедитесь, что сервер запущен.');
      orderBtn.disabled = false;
      orderBtn.textContent = 'Оформить заказ';
    }
  }

  // ===== ОБРАБОТЧИК ФОРМЫ =====
  // Мы используем одну форму, но два разных действия в зависимости от нажатой кнопки
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращаем стандартную перезагрузку страницы

    // Определяем, какая кнопка была нажата
    // В современных браузерах есть event.submitter, но для надежности проверим текст или атрибуты
    // В данном HTML кнопки имеют type="submit", поэтому нам нужно понять цель.
    // Проще всего проверить, скрыта ли кнопка расчета или нет.
    
    const isCalcButtonClicked = calcBtn.style.display !== 'none';

    if (isCalcButtonClicked) {
      await handleCalculation();
    } else {
      await handleOrderSubmission();
    }
  });

  // Дополнительно: Клик по кнопке "Оформить" тоже должен отправлять форму,
  // но так как она внутри формы (или связана form="calcForm"), submit сработает.
  // Если кнопка "Оформить" не внутри тега <form>, нужно добавить обработчик клика:
  orderBtn.addEventListener('click', (e) => {
    // Если кнопка не связана с формой через атрибут form, имитируем submit
    if (!orderBtn.form) {
       e.preventDefault();
       handleOrderSubmission();
    }
  });
});