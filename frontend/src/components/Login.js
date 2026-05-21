import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', totpCode: '' });
  const [message, setMessage] = useState('');
  const [totpRequired, setTotpRequired] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await login(form.username, form.password, form.totpCode);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.totpRequired) {
        setTotpRequired(true);
        setMessage('Введите код из Google Authenticator');
      } else {
        setMessage('Ошибка входа: ' + (data?.message || err.message));
      }
    }
  };

  return (
    <div className="page-wrapper page-wrapper-sm">
      <h2 className="page-title" style={{ textAlign: 'center' }}>Вход</h2>
      <form onSubmit={submit} className="card" style={{ padding: 24 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-username">Логин</label>
          <input
            id="login-username"
            className="form-input"
            placeholder="Логин"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            className="form-input"
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        {totpRequired && (
          <div className="form-group">
            <label className="form-label" htmlFor="login-totp">Код из Google Authenticator</label>
            <input
              id="login-totp"
              className="form-input"
              placeholder="Введите 6 цифр"
              maxLength={6}
              value={form.totpCode}
              onChange={e => setForm({ ...form, totpCode: e.target.value })}
              required
            />
          </div>
        )}
        {message && (
          <div className={`alert ${totpRequired ? 'alert-info' : 'alert-error'}`}>{message}</div>
        )}
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
          {totpRequired ? 'Подтвердить' : 'Войти'}
        </button>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}
