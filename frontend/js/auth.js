// Конфигурация API
const API_BASE = 'http://localhost:5000/api';

// Простая функция уведомлений (можно заменить на красивые тосты позже)
function notify(message, type = 'success') {
  alert(message);
}

// ===== ФОРМА ВХОДА =====
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = loginForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Входим...';
    btn.disabled = true;

    const formData = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен и данные пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        notify('✅ Вход выполнен успешно!', 'success');
        // Временно ведём на главную, позже заменим на dashboard.html
        setTimeout(() => window.location.href = 'index.html', 1000);
      } else {
        notify(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      notify('❌ Ошибка сети. Убедитесь, что бэкенд запущен (npm run dev)', 'error');
      console.error('Login error:', error);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ===== ФОРМА РЕГИСТРАЦИИ =====
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = registerForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Регистрация...';
    btn.disabled = true;

    const formData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      userType: 'PRIVATE' // По умолчанию частное лицо
    };

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        notify('✅ Регистрация успешна! Добро пожаловать.', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } else {
        notify(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      notify('❌ Ошибка сети. Убедитесь, что бэкенд запущен.', 'error');
      console.error('Register error:', error);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}