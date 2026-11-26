# REST API: менеджер паролей

Базовый URL: `http://localhost:3000/api/v1`
Формат обмена: JSON (`Content-Type: application/json`).

## Авторизация

Заголовок `Authorization: Bearer <token>`. Токен по умолчанию `dev-secret-token`, меняется переменной окружения `API_TOKEN`.
Без токена доступны: `GET /health`, `POST /passwords/generate`, `POST /passwords/check-strength`.

## Формат ответов

Успех (один объект): `{ "data": { ... } }`

Успех (список): `{ "data": [ ... ], "meta": { "page": 1, "limit": 10, "total": 25, "totalPages": 3 } }`

Ошибка:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации входных данных",
    "details": [{ "field": "title", "message": "\"title\" is required" }]
  }
}
```

## Коды ответов

| Код | Значение                                                                  |
| --- | ------------------------------------------------------------------------- |
| 200 | Успех                                                                     |
| 201 | Ресурс создан (заголовок `Location`)                                      |
| 204 | Удалено, тело пустое                                                      |
| 400 | Невалидные данные, битый JSON, несуществующая связь (`INVALID_REFERENCE`) |
| 401 | Нет токена или он неверный                                                |
| 404 | Ресурс или маршрут не найден                                              |
| 409 | Нарушена уникальность или удаляемый ресурс используется                   |
| 413 | Слишком большое тело запроса                                              |
| 500 | Внутренняя ошибка сервера                                                 |

## Параметры списков (общие)

`page` (от 1, по умолчанию 1), `limit` (1–100, по умолчанию 10), `sort`, `order` (`asc`/`desc`, по умолчанию `desc`), `search` (поиск по подстроке).

---

## Passwords

Поля: `title` (1–100, обяз.), `username` (1–100, обяз.), `password` (1–128; при создании, если не передан, генерируется), `url` (http/https, до 255), `notes` (до 1000), `category_id`, `user_id`.

### GET /passwords

Список. Поле `password` в списке не возвращается.
Параметры: `page`, `limit`, `sort` (`id|title|username|created_at`), `order`, `search` (по title и username), `category_id`, `user_id`.
Пример: `GET /passwords?page=1&limit=5&sort=title&order=asc&search=gma`
Ответ 200:

```json
{
  "data": [
    {
      "id": 5,
      "title": "Gmail",
      "username": "me@gmail.com",
      "url": null,
      "category_id": 1,
      "user_id": 1,
      "created_at": "2026-11-26T10:00:00.000Z",
      "updated_at": "2026-11-26T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 5, "total": 1, "totalPages": 1 }
}
```

Ошибки: 400 (невалидные параметры, например `sort=password`), 401.

### GET /passwords/:id

Детали записи (включая `password`). Ответ 200: `{ "data": { "id": 5, "title": "Gmail", "username": "me@gmail.com", "password": "MyPass123!", ... } }`
Ошибки: 400 (id не число), 401, 404.

### POST /passwords

Создание. Запрос:

```json
{
  "title": "Gmail",
  "username": "me@gmail.com",
  "password": "MyPass123!",
  "category_id": 1,
  "user_id": 1
}
```

Ответ 201 (+ `Location: /api/v1/passwords/5`): `{ "data": { "id": 5, "title": "Gmail", ... } }`
Ошибки: 400 (нет обязательного поля, неверный тип, несуществующие `category_id`/`user_id`), 401.

### PUT /passwords/:id

Полная замена. Обязательны `title`, `username`, `password`; не переданные необязательные поля становятся `null`.
Запрос: `{ "title": "Gmail 2", "username": "me2@gmail.com", "password": "NewPass456!" }`
Ответ 200: `{ "data": { ... } }`. Ошибки: 400, 401, 404.

### PATCH /passwords/:id

Частичное обновление: меняются только присланные поля, минимум одно.
Запрос: `{ "title": "Почта" }`. Ответ 200: `{ "data": { ... } }`. Ошибки: 400 (пустое тело), 401, 404.

### DELETE /passwords/:id

Ответ 204 (тело пустое). Ошибки: 400, 401, 404.

### POST /passwords/generate

Генератор (без токена). Все поля необязательны: `length` (8–128, по умолчанию 16), `lowercase`, `uppercase`, `digits`, `symbols` (boolean, по умолчанию true), `excludeAmbiguous` (убрать похожие символы `I l 1 O 0 o`, по умолчанию false).
Запрос: `{ "length": 20, "symbols": false }`
Ответ 200:

```json
{
  "data": {
    "password": "aF3kQ9xLmP2vTb7RzW5n",
    "length": 20,
    "strength": {
      "score": 4,
      "label": "сильный",
      "length": 20,
      "character_classes": 3
    }
  }
}
```

Ошибки: 400 (длина вне диапазона или все наборы символов выключены).

### POST /passwords/check-strength

Оценка надёжности (без токена). Запрос: `{ "password": "123456" }`
Ответ 200: `{ "data": { "score": 0, "label": "очень слабый", "length": 6, "character_classes": 1 } }`
Ошибки: 400 (нет `password`).

### POST /passwords/:id/regenerate

Заменяет пароль записи новым сгенерированным. Тело как у `/generate` (необязательно).
Ответ 200: `{ "data": { "id": 5, "password": "новый пароль", ... } }`. Ошибки: 400, 401, 404.

---

## Categories

Поля: `name` (1–50, уникальное, обяз.), `description` (до 255). Параметры списка: общие, `sort` = `id|name|created_at`. Все запросы требуют токен.

### GET /categories

Ответ 200: `{ "data": [{ "id": 1, "name": "Соцсети", "description": null, ... }], "meta": { ... } }`. Ошибки: 400, 401.

### GET /categories/:id

Ответ 200: `{ "data": { "id": 1, "name": "Соцсети", ... } }`. Ошибки: 400, 401, 404.

### POST /categories

Запрос: `{ "name": "Соцсети", "description": "Аккаунты в соцсетях" }`. Ответ 201. Ошибки: 400, 401, 409 (имя занято).

### PUT /categories/:id

Запрос: `{ "name": "Почта", "description": null }`. Ответ 200. Ошибки: 400, 401, 404, 409.

### PATCH /categories/:id

Запрос: `{ "description": "Новое описание" }`. Ответ 200. Ошибки: 400, 401, 404, 409.

### DELETE /categories/:id

Ответ 204. Ошибки: 400, 401, 404, 409 (в категории есть пароли).

### GET /categories/:id/passwords

Пароли категории; параметры как у `GET /passwords`. Ответ 200 (формат списка). Ошибки: 400, 401, 404.

---

## Users

Поля: `username` (3–50, только буквы и цифры, уникальный), `email` (корректный, уникальный), `master_password` (8–128, только на запись; хранится в виде bcrypt-хэша и никогда не возвращается). Параметры списка: общие, `sort` = `id|username|email|created_at`; `search` ищет по username и email. Все запросы требуют токен.

### GET /users

Ответ 200: `{ "data": [{ "id": 1, "username": "dasha", "email": "d@mail.ru", ... }], "meta": { ... } }`. Ошибки: 400, 401.

### GET /users/:id

Ответ 200. Ошибки: 400, 401, 404.

### POST /users

Запрос: `{ "username": "dasha", "email": "d@mail.ru", "master_password": "Str0ng!Pass" }`. Ответ 201. Ошибки: 400, 401, 409 (username или email заняты).

### PUT /users/:id

Нужны все три поля. Ответ 200. Ошибки: 400, 401, 404, 409.

### PATCH /users/:id

Запрос: `{ "email": "new@mail.ru" }`. Ответ 200. Ошибки: 400, 401, 404, 409.

### DELETE /users/:id

Ответ 204. Пароли пользователя удаляются вместе с ним. Ошибки: 400, 401, 404.

### GET /users/:id/passwords

Пароли пользователя; параметры как у `GET /passwords`. Ответ 200. Ошибки: 400, 401, 404.

---

## Служебное

### GET /health

Ответ 200: `{ "data": { "status": "ok" } }` (без токена).
