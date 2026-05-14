// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // Элементы шапки
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  // Проверяем авторизацию
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (token && user) {
    // ✅ Пользователь авторизован
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  } else {
    //  Пользователь не авторизован
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (profileBtn) profileBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  // 🚪 Логика выхода
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Вы действительно хотите выйти из аккаунта?')) {
        localStorage.clear(); // Очищаем токен и данные пользователя
        
        // Мгновенно обновляем шапку
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (profileBtn) profileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Перенаправляем на главную
        window.location.href = 'index.html';
      }
    });
  }

  // Инициализация анимаций (если подключен AOS)
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, once: true });
  }

  // === ЛОГИКА: Фура едет вместе со скроллом ===
  const truck = document.getElementById('road-truck');
  
  // Используем passive: true для плавности прокрутки на мобильных
  window.addEventListener('scroll', () => {
    if (!truck) return;

    // 1. Вычисляем, насколько прокручена страница (от 0 до 1)
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrollProgress = window.scrollY / totalHeight;

    // 2. Двигаем фуру. 
    // Мы используем 85vh, чтобы фура не уезжала за пределы экрана до конца
    const truckPosition = scrollProgress * 85; 
    
    // 3. Применяем позицию (сдвиг по вертикали + центрирование по горизонтали)
    truck.style.transform = `translate(-50%, ${truckPosition}vh)`;
  });
});