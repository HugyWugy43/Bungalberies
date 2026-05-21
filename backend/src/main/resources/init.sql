-- ============================================
-- Инициализация базы данных Bungalberies
-- Выполняется автоматически при первом запуске PostgreSQL контейнера
-- ============================================

-- ============================================
-- Справочники
-- ============================================

CREATE TABLE IF NOT EXISTS access_levels (
    access_level_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS statuses (
    status_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- ============================================
-- Основные сущности
-- ============================================

CREATE TABLE IF NOT EXISTS authentications (
    account_id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    sms_code VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES authentications(account_id) ON DELETE SET NULL,
    access_level_id INTEGER REFERENCES access_levels(access_level_id) ON DELETE SET NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    name VARCHAR(100),
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_details TEXT
);

-- ============================================
-- Промежуточные таблицы (N-N связи)
-- ============================================

CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES products(item_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    status_id INTEGER REFERENCES statuses(status_id) ON DELETE SET NULL,
    payment_id INTEGER REFERENCES payments(payment_id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    customer_name VARCHAR(100),
    customer_email VARCHAR(100),
    customer_phone VARCHAR(20),
    shipping_address TEXT,
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем колонку is_guest, если таблица уже существует (для обновлений)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'is_guest') THEN
        ALTER TABLE orders ADD COLUMN is_guest BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Обновляем старые записи, где is_guest NULL
UPDATE orders SET is_guest = FALSE WHERE is_guest IS NULL;

CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES products(item_id) ON DELETE RESTRICT,
    product_name VARCHAR(200),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
);

-- ============================================
-- Индексы
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_account ON users(account_id);
CREATE INDEX IF NOT EXISTS idx_users_access_level ON users(access_level_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_item ON cart(item_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_item ON order_items(item_id);

-- ============================================
-- Тестовые данные
-- ============================================

INSERT INTO access_levels (name) VALUES
    ('USER'),
    ('ADMIN'),
    ('MODERATOR')
ON CONFLICT (name) DO NOTHING;

INSERT INTO statuses (name) VALUES
    ('Новый'),
    ('В обработке'),
    ('Отправлен'),
    ('Доставлен'),
    ('Отменён')
ON CONFLICT (name) DO NOTHING;

INSERT INTO authentications (phone, sms_code) VALUES
    ('+79001112233', '1234'),
    ('+79004445566', '5678'),
    ('+79007778899', NULL)
ON CONFLICT (phone) DO NOTHING;

INSERT INTO users (account_id, access_level_id, phone, email, name, username, password, role)
SELECT
    a.account_id,
    al.access_level_id,
    v.phone,
    v.email,
    v.name,
    v.username,
    v.password,
    v.role
FROM (VALUES
    (1, 2, '+79001112233', 'admin@shop.ru', 'Администратор', 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_ADMIN'),
    (2, 1, '+79004445566', 'user@shop.ru', 'Иван Петров', 'user', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_USER'),
    (3, 1, '+79007778899', 'guest@shop.ru', 'Мария Сидорова', 'guest', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ROLE_USER')
) AS v(acc_id, al_id, phone, email, name, username, password, role)
JOIN authentications a ON a.phone = v.phone
JOIN access_levels al ON al.access_level_id = v.al_id
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.username = v.username);

INSERT INTO products (name, description, quantity, price) VALUES
    ('Блокнот А4', 'Линейка, 96 листов', 50, 99.00),
    ('Ручка шариковая', 'Синяя, 0.7мм', 200, 19.00),
    ('Наушники проводные', '3.5mm jack, стерео', 15, 1299.00),
    ('Футболка хлопковая', 'Размер M, белый', 30, 899.00),
    ('Кружка керамическая', '350мл, с принтом', 45, 349.00),
    ('Рюкзак городской', '20л, водоотталкивающий', 10, 2499.00),
    ('Зонт автоматический', 'Складной, чёрный', 25, 799.00),
    ('Чехол для телефона', 'Универсальный, силикон', 100, 299.00)
ON CONFLICT DO NOTHING;

INSERT INTO payments (receipt_number, payment_date, account_details) VALUES
    ('RCP-001', '2024-01-15 10:30:00', 'Карта ****1234'),
    ('RCP-002', '2024-01-16 14:20:00', 'Карта ****5678'),
    ('RCP-003', '2024-01-17 09:15:00', 'СБП')
ON CONFLICT DO NOTHING;

INSERT INTO cart (user_id, item_id, quantity)
SELECT u.user_id, p.item_id, v.qty
FROM (VALUES
    (1, 1, 2),
    (1, 3, 1),
    (1, 5, 1),
    (2, 2, 5),
    (2, 4, 1),
    (2, 5, 2),
    (2, 7, 1),
    (3, 6, 1),
    (3, 8, 2)
) AS v(uid, iid, qty)
JOIN users u ON u.user_id = v.uid
JOIN products p ON p.item_id = v.iid
ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = EXCLUDED.quantity;

INSERT INTO orders (user_id, status_id, payment_id, total_amount, customer_name, customer_email, customer_phone, shipping_address, is_guest)
SELECT
    u.user_id,
    s.status_id,
    p.payment_id,
    v.total,
    v.cust_name,
    v.cust_email,
    v.cust_phone,
    v.address,
    v.guest
FROM (VALUES
    (1, 4, 1, 1497.00, 'Администратор', 'admin@shop.ru', '+79001112233', 'г. Москва, ул. Ленина, д. 1, кв. 10', FALSE),
    (2, 2, 2, 1793.00, 'Иван Петров', 'user@shop.ru', '+79004445566', 'г. Санкт-Петербург, пр. Невский, д. 25, кв. 5', FALSE),
    (NULL, 1, 3, 648.00, 'Мария Сидорова', 'guest@shop.ru', '+79007778899', 'г. Казань, ул. Баумана, д. 15', TRUE)
) AS v(uid, sid, pid, total, cust_name, cust_email, cust_phone, address, guest)
LEFT JOIN users u ON u.user_id = v.uid
JOIN statuses s ON s.status_id = v.sid
JOIN payments p ON p.payment_id = v.pid
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_phone = v.cust_phone AND o.payment_id = v.pid);

INSERT INTO order_items (order_id, item_id, product_name, price, quantity)
SELECT
    o.order_id,
    p.item_id,
    p.name,
    p.price,
    v.qty
FROM (VALUES
    (1, 1, 2),
    (1, 3, 1),
    (2, 2, 5),
    (2, 4, 1),
    (2, 5, 2),
    (3, 6, 1),
    (3, 8, 1)
) AS v(oid, iid, qty)
JOIN orders o ON o.order_id = v.oid
JOIN products p ON p.item_id = v.iid
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi
    WHERE oi.order_id = v.oid AND oi.item_id = v.iid
);

-- ============================================
-- Предоставление прав
-- ============================================

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shopuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO shopuser;
GRANT USAGE ON SCHEMA public TO shopuser;
