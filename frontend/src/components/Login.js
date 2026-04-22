import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Страница входа пользователя в систему.
 * <p>
 * Обеспечивает отправку учетных данных, получение токена и перенаправление
 * пользователя на главную страницу после успешной авторизации.
 */
export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * Отправляет форму авторизации на сервер.
   *
   * @param {Event} e событие отправки формы
   */
  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form.username, form.password);
      setMessage('Вход выполнен');
      navigate('/');
    } catch (err) {
      console.error(err);
      setMessage('Ошибка входа: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Вход</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Логин" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit">Войти</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}