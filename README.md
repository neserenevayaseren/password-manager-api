# Менеджер паролей (REST API + веб-интерфейс)

Node.js / Express 5, PostgreSQL, EJS. Практическое занятие №2 (ветка `pz22`).

## Требования

- Node.js 18.11 или новее
- PostgreSQL

## Запуск

1. Установить зависимости: `npm install`
2. Создать базу данных `password_manager` и выполнить схему:
   `psql -U postgres -d password_manager -f db/schema.sql`
   (или открыть `db/schema.sql` в pgAdmin и выполнить)
3. При необходимости задать переменные окружения (по умолчанию значения из `db.js`):
   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `API_TOKEN` (по умолчанию `dev-secret-token`)
4. Запустить: `npm run dev` (с автоперезапуском) или `npm start`

Сервер: http://localhost:3000

- Веб-интерфейс: http://localhost:3000/
- REST API: http://localhost:3000/api/v1 (проверка: `/api/v1/health`)

## Документация

Описание всех эндпоинтов: [API.md](API.md). Примеры запросов: http/api.http (расширение REST Client для VS Code).

## Примечание

Вместо временного хранилища в массиве используется PostgreSQL.
