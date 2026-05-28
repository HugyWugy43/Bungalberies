import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function calcStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}

const LEVELS = [
  { label: 'Очень слабый', color: '#EF4444', width: '20%' },
  { label: 'Слабый',       color: '#F97316', width: '40%' },
  { label: 'Средний',      color: '#F59E0B', width: '60%' },
  { label: 'Хороший',      color: '#10B981', width: '80%' },
  { label: 'Надёжный',     color: '#059669', width: '100%' },
];

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', email: '', phone: '' });
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [devCode, setDevCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, sendCode } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const level = useMemo(() => {
    const s = calcStrength(form.password);
    return s === 0 ? null : LEVELS[s - 1];
  }, [form.password]);

  const checks = useMemo(() => [
    { label: 'Больше 8 символов', ok: form.password.length >= 8 },
    { label: 'Есть заглавные буквы (A-Z)', ok: /[A-Z]/.test(form.password) },
    { label: 'Есть строчные буквы (a-z)', ok: /[a-z]/.test(form.password) },
    { label: 'Есть цифры (0-9)', ok: /[0-9]/.test(form.password) },
  ], [form.password]);

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
      const res = await sendCode(email);
      setMessage(`Код отправлен на ${email}`);
      if (res.code) {
        setDevCode(res.code);
      }
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
          {form.password.length > 0 && (
            <>
              <div style={{ marginTop: 8, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: level?.width || '0%',
                  background: level?.color || '#E2E8F0',
                  borderRadius: 3, transition: 'all 0.3s ease'
                }} />
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: level?.color || '#94A3B8', fontWeight: 600 }}>
                {level?.label || ''}
              </div>
              <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', fontSize: 12 }}>
                {checks.map((c, i) => (
                  <li key={i} style={{ color: c.ok ? '#10B981' : '#94A3B8', marginBottom: 2 }}>
                    {c.ok ? '✓' : '○'} {c.label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email *</label>
          <input
            id="reg-email" name="email" className="form-input" type="email"
            placeholder="ivan@example.com"
            value={form.email} onChange={handleChange} required
          />
        </div>

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
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              id="reg-code" className="form-input"
              placeholder="Введите 6 цифр"
              value={code} onChange={e => setCode(e.target.value)}
              maxLength={6} required style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-outline" onClick={handleSendCode} disabled={loading}
              style={{ whiteSpace: 'nowrap' }}>
              {loading ? '...' : 'Получить'}
            </button>
          </div>
          {devCode && (
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', background: 'var(--border-light)', padding: '6px 10px', borderRadius: 4 }}>
              Код для разработки: <strong>{devCode}</strong> (SMTP не настроен)
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}
          disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>

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
