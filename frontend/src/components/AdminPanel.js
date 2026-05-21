import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
  const { user, role } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const res = await api.post('/auth/signin', form);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username);
        localStorage.setItem('role', res.data.role);
        window.location.reload();
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка входа');
        setLoading(false);
      }
    };

    return (
      <div className="page-wrapper page-wrapper-sm">
        <h2 className="page-title" style={{ textAlign: 'center' }}>Вход для администратора</h2>
        <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">Логин</label>
            <input className="form-input" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}
            disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
          {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
        </form>
      </div>
    );
  }

  if (role !== 'ROLE_ADMIN') {
    return (
      <div className="page-wrapper page-wrapper-sm">
        <div className="alert alert-info">Доступно только для администратора.</div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', quantity: '', imageUrl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products').then(r => {
      setProducts(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function startEdit(p) {
    setEditing({ ...p, stock: p.stock ?? p.quantity });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    try {
      const res = await api.put(`/products/${editing.id}`, {
        ...editing,
        quantity: editing.stock ?? editing.quantity,
      });
      setProducts(prev => prev.map(p => p.id === editing.id ? res.data : p));
      setEditing(null);
    } catch (err) {
      alert('Ошибка при сохранении');
    }
  }

  async function addProduct(e) {
    e.preventDefault();
    try {
      const res = await api.post('/products', {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity, 10),
        imageUrl: newProduct.imageUrl,
      });
      setProducts(prev => [...prev, res.data]);
      setAdding(false);
      setNewProduct({ name: '', description: '', price: '', quantity: '', imageUrl: '' });
    } catch (err) {
      alert('Ошибка при создании');
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Ошибка при удалении');
    }
  }

  if (loading) return <div className="page-wrapper"><div className="loading"><div className="spinner" /> Загрузка...</div></div>;

  return (
    <div className="page-wrapper page-wrapper-md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Админ-панель</h2>
        <button className="btn btn-primary" onClick={() => setAdding(true)}>
          + Добавить товар
        </button>
      </div>

      {adding && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Новый товар</h3>
          <form onSubmit={addProduct}>
            <div className="form-group">
              <label className="form-label">Название *</label>
              <input className="form-input" value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Описание</label>
              <textarea className="form-input" rows={3} value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Цена *</label>
                <input className="form-input" type="number" step="0.01" value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Количество *</label>
                <input className="form-input" type="number" value={newProduct.quantity}
                  onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">URL изображения</label>
              <input className="form-input" value={newProduct.imageUrl}
                onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg" />
            </div>
            <div className="admin-actions">
              <button type="submit" className="btn btn-primary">Добавить</button>
              <button type="button" className="btn btn-outline" onClick={() => setAdding(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {products.map(p => (
        <div key={p.id} className="admin-card">
          {editing && editing.id === p.id ? (
            <div>
              <div className="form-group">
                <label className="form-label">Название</label>
                <input className="form-input" value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea className="form-input" rows={3} value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">URL изображения</label>
                <input className="form-input" value={editing.imageUrl || ''}
                  onChange={e => setEditing({ ...editing, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Цена</label>
                  <input className="form-input" type="number" step="0.01" value={editing.price}
                    onChange={e => setEditing({ ...editing, price: parseFloat(e.target.value) })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Количество</label>
                  <input className="form-input" type="number" value={editing.stock ?? editing.quantity}
                    onChange={e => setEditing({ ...editing, stock: parseInt(e.target.value, 10) })} />
                </div>
              </div>
              <div className="admin-actions">
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>Сохранить</button>
                <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Отмена</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.description}</div>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 500 }}>{p.price} ₽</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>
                      В наличии: {p.quantity ?? p.stock}
                    </span>
                  </div>
                </div>
              </div>
              <div className="admin-actions" style={{ marginTop: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>Изменить</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>Удалить</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
