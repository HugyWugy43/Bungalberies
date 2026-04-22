import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Страница регистрации нового пользователя.
 * <p>
 * Позволяет создать учетную запись в системе и затем перейти к странице входа.
 */
export default function Register() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Отправляет данные регистрации на сервер.
   *
   * @param {Event} e событие отправки формы
   */
  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form.username, form.password);
      setMessage('Зарегистрировано. Выполняется вход...');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      console.error(err);
      setMessage('Ошибка регистрации: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h2>Регистрация</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <input placeholder="Логин" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div style={{ marginBottom: 8 }}>
          <input type="password" placeholder="Пароль" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit">Зарегистрироваться</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}