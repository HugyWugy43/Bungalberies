# Bungalberies

Интернет-магазин с бэкендом (Java), фронтендом (React) и PostgreSQL.

## Требования

- Java 17+
- PostgreSQL
- Node.js и npm

## Запуск

### База данных

```bash
docker compose up -d db
```

### Бэкенд

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

Бэкенд будет доступен на http://localhost:8080.

### Фронтенд

```bash
cd frontend
npm install
npm start
```

Фронтенд будет доступен на http://localhost:3000.

## Тестирование

```bash
cd backend
.\mvnw.cmd test
```

Тесты используют H2 in-memory БД (профиль `test`), поэтому внешняя БД не требуется.

### Реализованные тесты (17 шт.)

**AuthControllerTest** — проверка аутентификации:
- `signup_success` — успешная регистрация нового пользователя
- `signup_duplicate_username` — регистрация с уже существующим username
- `signup_blank_username` — регистрация с пустым username
- `signin_success` — успешная авторизация пользователя
- `signin_invalid_password` — авторизация с неверным паролем

**CartControllerTest** — проверка корзины:
- `addToCart_success` — добавление товара в корзину
- `updateQuantity_success` — изменение количества товара в корзине
- `removeFromCart_success` — удаление товара из корзины
- `getCart_empty` — просмотр пустой корзины

**OrderControllerTest** — проверка заказов:
- `placeOrder_success` — успешное оформление заказа
- `placeGuestOrder_success` — оформление гостевого заказа
- `getAllOrders_success` — просмотр истории заказов
- `trackOrders_byEmail_success` — отслеживание заказа по email

**ProductControllerTest** — проверка товаров и админ-панели:
- `addProduct_admin_success` — добавление товара через админ-панель
- `getAllProducts_success` — просмотр списка товаров
- `updateProduct_admin_success` — обновление товара администратором
- `deleteProduct_admin_success` — удаление товара администратором

## Подключение к БД в контейнере

```bash
docker exec -it bungalberies-db psql -U shopuser -d postgres
```
