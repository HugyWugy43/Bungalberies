import React, { useEffect, useState } from 'react';
import api from '../services/api';

const ADMIN_TOKEN_KEY = 'admin_token';

function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

function adminApi() {
  const token = getAdminToken();
  const instance = api;
  instance.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
  return instance;
}

export default function AdminPanel() {
  const [token, setTokenState] = useState(getAdminToken());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function setToken(t) {
    localStorage.setItem(ADMIN_TOKEN_KEY, t);
    setTokenState(t);
  }

  function clearToken() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setTokenState(null);
  }

  if (!token) {
    const handleLogin = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const res = await api.post('/admin/login', { password });
        setToken(res.data.token);
      } catch (err) {
        setError(err.response?.data?.message || 'Неверный пароль');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="page-wrapper page-wrapper-sm">
        <h2 className="page-title" style={{ textAlign: 'center' }}>Вход в админ-панель</h2>
        <form onSubmit={handleLogin} className="card" style={{ padding: 24 }}>
          <div className="form-group">
            <label className="form-label">Пароль администратора</label>
            <input className="form-input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required autoFocus />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
          {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
        </form>
      </div>
    );
  }

  return <AdminDashboard onLogout={clearToken} />;
}

function AdminDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', quantity: '', imageUrl: '', photo: '', characteristics: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi().get('/products').then(r => {
      setProducts(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function startEdit(p) {
    setEditing({
      ...p,
      stock: p.stock ?? p.quantity,
      photoPreview: p.photo || p.imageUrl || '',
      characteristics: p.characteristics || '',
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function saveEdit() {
    try {
      const body = {
        ...editing,
        quantity: editing.stock ?? editing.quantity,
      };
      delete body.stock;
      delete body.photoPreview;
      const res = await adminApi().put(`/products/${editing.id}`, body);
      setProducts(prev => prev.map(p => p.id === editing.id ? res.data : p));
      setEditing(null);
    } catch (err) {
      alert('Ошибка при сохранении');
    }
  }

  async function addProduct(e) {
    e.preventDefault();
    try {
      const body = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity, 10),
        imageUrl: newProduct.imageUrl,
        photo: newProduct.photo,
        characteristics: newProduct.characteristics,
      };
      const res = await adminApi().post('/products', body);
      setProducts(prev => [...prev, res.data]);
      setAdding(false);
      setNewProduct({ name: '', description: '', price: '', quantity: '', imageUrl: '', photo: '', characteristics: '' });
    } catch (err) {
      alert('Ошибка при создании');
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Удалить товар?')) return;
    try {
      await adminApi().delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Ошибка при удалении');
    }
  }

  function handleImageUpload(file, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result);
    reader.readAsDataURL(file);
  }

  if (loading) return <div className="page-wrapper"><div className="loading"><div className="spinner" /> Загрузка...</div></div>;

  return (
    <div className="page-wrapper page-wrapper-md" style={{ paddingTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="page-title" style={{ margin: 0 }}>Админ-панель</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setAdding(true)}>+ Добавить товар</button>
          <button className="btn btn-outline btn-sm" onClick={onLogout}>Выйти</button>
        </div>
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
            <div className="form-group">
              <label className="form-label">Характеристики</label>
              <textarea className="form-input" rows={3} value={newProduct.characteristics}
                onChange={e => setNewProduct({ ...newProduct, characteristics: e.target.value })}
                placeholder="Например:&#10;Материал: пластик&#10;Цвет: красный&#10;Размер: 10x20 см" />
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
              <label className="form-label">Фото</label>
              <input className="form-input" type="file" accept="image/*"
                onChange={e => handleImageUpload(e.target.files[0], data => setNewProduct({ ...newProduct, photo: data }))} />
              {newProduct.photo && <img src={newProduct.photo} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, marginTop: 8 }} />}
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
                <label className="form-label">Характеристики</label>
                <textarea className="form-input" rows={3} value={editing.characteristics}
                  onChange={e => setEditing({ ...editing, characteristics: e.target.value })}
                  placeholder="Например:&#10;Материал: пластик&#10;Цвет: красный" />
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
              <div className="form-group">
                <label className="form-label">Фото</label>
                <input className="form-input" type="file" accept="image/*"
                  onChange={e => handleImageUpload(e.target.files[0], data => setEditing({ ...editing, photo: data, photoPreview: data }))} />
                {editing.photoPreview && (
                  <img src={editing.photoPreview} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, marginTop: 8 }} />
                )}
              </div>
              <div className="admin-actions">
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>Сохранить</button>
                <button className="btn btn-outline btn-sm" onClick={cancelEdit}>Отмена</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {(p.photo || p.imageUrl) && (
                  <img src={p.photo || p.imageUrl} alt={p.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                    onError={e => { e.target.style.display = 'none' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.description}</div>
                  {p.characteristics && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, whiteSpace: 'pre-wrap' }}>{p.characteristics}</div>
                  )}
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
