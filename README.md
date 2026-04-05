# OpKit

Mini CRM с real-time управлением задачами.

**Стек:** NestJS · Prisma · PostgreSQL · Redis · React · TypeScript · Tailwind CSS · Socket.IO

---

## Требования

- Node.js 18+
- Docker + docker-compose

---

## Локальный запуск

### 1. Клонировать репозиторий и установить зависимости

```bash
git clone <repo-url>
cd opkit
npm install
```

### 2. Создать `.env` для бэкенда

Создать файл `apps/backend/.env`:

```env
DATABASE_URL="postgresql://opkit:opkit_secret@localhost:5433/opkit_db"
JWT_SECRET=super_secret_dev_key_change_in_production
JWT_EXPIRES_IN=7d
BACKEND_PORT=3000
```

### 3. Запустить базу данных и Redis

```bash
docker-compose up -d
```

### 4. Применить миграции Prisma

```bash
cd apps/backend
npx prisma migrate deploy
cd ../..
```

### 5. Запустить проект

```bash
# Бэкенд и фронтенд одновременно
npm run dev

# Или по отдельности:
npm run dev:backend
npm run dev:frontend
```

---

## Адреса

| Сервис    | URL                       |
|-----------|---------------------------|
| Frontend  | http://localhost:5173      |
| Backend   | http://localhost:3000      |
| PostgreSQL | localhost:5433            |
| Redis     | localhost:6379             |

---

## Полезные команды

```bash
# Остановить Docker-контейнеры
docker-compose down

# Открыть Prisma Studio (просмотр БД)
cd apps/backend && npx prisma studio

# Создать новую миграцию после изменения схемы
cd apps/backend && npx prisma migrate dev --name <название>
```

---

## Структура проекта

```
opkit/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── prisma/       # Схема и миграции
│   │   └── src/
│   │       ├── auth/
│   │       ├── boards/
│   │       ├── tasks/
│   │       ├── labels/
│   │       └── users/
│   └── frontend/         # React + Vite
│       └── src/
│           ├── api/
│           ├── components/
│           ├── hooks/
│           ├── pages/
│           ├── store/
│           └── types/
├── docker-compose.yml
└── package.json
```
