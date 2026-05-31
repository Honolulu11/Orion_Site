// Ждём полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://localhost:5000/api';

  function notify(message, type = 'success') {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  }

  // ===== ФОРМА ВХОДА =====
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    console.log('✅ Форма входа найдена');
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // ← Блокируем перезагрузку
      console.log(' Отправка формы входа...');

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

        console.log(' Ответ сервера:', response.status);
        const data = await response.json();
        console.log('📦 Данные:', data);

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          notify('✅ Вход выполнен успешно!', 'success');
          setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
          notify(`❌ ${data.error || 'Ошибка авторизации'}`, 'error');
        }
      } catch (error) {
        console.error('🔥 Ошибка fetch:', error);
        notify('❌ Ошибка подключения к серверу', 'error');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  } else {
    console.error('❌ Форма входа НЕ найдена! Проверь id="loginForm" в HTML');
  }

  // ===== ФОРМА РЕГИСТРАЦИИ =====
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    console.log('✅ Форма регистрации найдена');
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('📤 Отправка формы регистрации...');

      const btn = registerForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Регистрация...';
      btn.disabled = true;

      const userType = document.querySelector('input[name="userType"]:checked')?.value || 'PRIVATE';

      const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        userType
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
          notify('✅ Регистрация успешна!', 'success');
          setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
          notify(`❌ ${data.error}`, 'error');
        }
      } catch (error) {
        console.error(' Ошибка регистрации:', error);
        notify('❌ Ошибка подключения к серверу', 'error');
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }
});