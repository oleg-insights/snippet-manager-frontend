# Snippet Manager WEB

Веб-интерфейс для управления шаблонами сообщений с динамической системой тегов на Vue.js.

### Стек

- Vue 3 (Composition API)
- Vite
- Pinia
- Axios
- Vue Router
- VueUse
- Docker (контейнеризация)

### Функциональность

- Аутентификация (вход/регистрация/выход)
- Управление шаблонами (CRUD, публикация/снятие с публикации)
- Иерархический поиск шаблонов по тегам
- Уведомления в реальном времени (WebSockets)
- Админ-панель (управление пользователями)

### Запуск для разработки (локально)

1. Убедитесь, что [бэкенд](https://github.com/oleg-insights/snippet-manager-backend) запущен (локально или в Docker).
2. В `.env.development` (уже есть в проекте) укажите адрес API:
   `VITE_API_URL=http://localhost:3000/api`
3. Установите зависимости:
   `npm install`
4. Запустите: `npm run dev`
5. Откройте в браузере: http://localhost:5173

### Запуск в связке с бэкендом через Docker

1. Склонируйте репозиторий [бэкенда](https://github.com/oleg-insights/snippet-manager-backend) и этот репозиторий в соседние папки:

```
snippet-manager-backend/
snippet-manager-frontend/
```

2. В папке бэкенда выполните: `docker-compose up -d --build`
3. Откройте в браузере: http://localhost

### Структура проекта

- `src/api` — вызовы API (Axios)
- `src/components` — переиспользуемые UI-компоненты
- `src/views` — страницы приложения
- `src/store` — хранилища Pinia
- `src/router` — маршруты
- `src/utils` — утилиты
- `src/assets` — статика

### Зависимости

Проект является клиентской частью и требует запущенного бэкенда. Репозиторий бэкенда: [snippet-manager-backend](https://github.com/oleg-insights/snippet-manager-backend).
