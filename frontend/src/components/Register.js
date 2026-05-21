import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', phone: '' });
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, sendCode } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendCode = async () => {
    const email = form.email.trim();
    if (!email) {
      setMessage('Укажите email');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setMessage('Некорректный формат email');
      return;
    }
    setMessage('');
    setLoading(true);
    try {
      await sendCode(email);
      setCodeSent(true);
      setMessage(`Код отправлен на ${email}`);
    } catch (err) {
      setMessage('Ошибка при отправке кода');
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setMessage('Введите код подтверждения');
      return;
    }
    setMessage('');
    setLoading(true);
    try {
      await register(
        form.username.trim(),
        form.password,
        form.phone.trim(),
        form.email.trim(),
        code.trim()
      );
      setMessage('Регистрация успешна!');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper page-wrapper-sm">
      <h2 className="page-title" style={{ textAlign: 'center' }}>Регистрация</h2>

      <form onSubmit={submit} className="card" style={{ padding: 24 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-username">Логин</label>
          <input
            id="reg-username" name="username" className="form-input"
            placeholder="Придумайте логин"
            value={form.username} onChange={handleChange} required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-password">Пароль</label>
          <input
            id="reg-password" name="password" className="form-input" type="password"
            placeholder="Придумайте пароль"
            value={form.password} onChange={handleChange} required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email *</label>
          <input
            id="reg-email" name="email" className="form-input" type="email"
            placeholder="ivan@example.com"
            value={form.email} onChange={handleChange} required
          />
        </div>

        {!codeSent ? (
          <button type="button" className="btn btn-primary btn-lg" style={{ width: '100%' }}
            onClick={handleSendCode} disabled={loading}>
            {loading ? 'Отправка...' : 'Получить код'}
          </button>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-phone">Номер телефона (необязательно)</label>
              <input
                id="reg-phone" name="phone" className="form-input" type="tel"
                placeholder="+7 (999) 123-45-67"
                value={form.phone} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-code">Код из письма</label>
              <input
                id="reg-code" className="form-input"
                placeholder="Введите 6 цифр"
                value={code} onChange={e => setCode(e.target.value)}
                maxLength={6} required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}
              disabled={loading}>
              {loading ? 'Регистрация...' : 'Подтвердить и зарегистрироваться'}
            </button>
          </>
        )}

        {message && (
          <div className={`alert ${message.includes('успеш') || message.includes('отправлен') ? 'alert-success' : 'alert-error'}`}
               style={{ marginTop: 12 }}>
            {message}
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
