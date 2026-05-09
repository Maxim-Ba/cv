# CV — Интерактивное резюме (Angular SSR)

[![CI](https://github.com/Maxim-Ba/cv/actions/workflows/ci.yml/badge.svg)](https://github.com/Maxim-Ba/cv/actions/workflows/ci.yml)
[![Angular](https://img.shields.io/badge/Angular-17-red)](https://angular.dev/)
[![SSR](https://img.shields.io/badge/SSR-enabled-brightgreen)]()

Интерактивное онлайн-резюме с серверным рендерингом (SSR), тёмной темой и фильтрацией технологий по тегам.

🌐 **Живой сайт:** https://cv.maxim-balashov.ru/

## Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Фреймворк | Angular 17 (standalone) |
| Рендеринг | Angular SSR (@angular/ssr) |
| UI библиотека | Angular Material 17 |
| API клиент | ng-openapi-gen (из Swagger) |
| Стилизация | SCSS |
| Контейнеризация | Docker + nginx |
| CI | GitHub Actions |

## Возможности

- **Server-Side Rendering** — SEO-friendly, быстрая первая отрисовка
- **Dark mode** — переключение темы в хедере
- **Фильтрация технологий** по тегам (сигналы Angular)
- **Секции CV**: основная информация, о себе, места работы, технологии, образование
- **Типобезопасный API клиент** — генерируется автоматически из Swagger бэкенда
- **OnPush** — везде используется `ChangeDetectionStrategy.OnPush`
- **Глобальная обработка HTTP ошибок** — пользователь видит уведомление при сбое

## Архитектура

```
AppComponent
  ├── sections/         — основные секции CV (about-me, work-history, technologies, education)
  │     └── каждая секция → inject(Service) → API → сигналы
  ├── widgets/          — переиспользуемые UI-блоки (header, footer, drawer, snack-bar)
  ├── services/
  │     ├── api/        — тонкие сервисы над generated API client
  │     └── ...         — application-stab, notify, download-cv
  ├── interceptors/     — ssr-base-url + http-error (уведомления SnackBar)
  └── api/              — СГЕНЕРИРОВАННЫЙ код (ng-openapi-gen, не редактировать!)
```

## Разработка

```bash
# Установить зависимости
npm install

# Dev-сервер с прокси к бэкенду
npm start                        # http://localhost:4200

# SSR build
npm run build

# Запуск SSR сервера
npm run serve:ssr:balashov-cv-client

# Регенерация API клиента (требует запущенного бэкенда)
npm run generate:api
```

## Docker

```bash
# Сборка и запуск
docker-compose up

# Приложение доступно на http://localhost:81
```

## Переменные окружения

| Переменная | Описание | Значение |
|-----------|----------|---------|
| `PORT` | Порт SSR Node.js сервера | `4000` |
| `BACKEND_URL` | URL бэкенда (для SSR interceptor) | `http://backend:3333` |

## API генерация

API клиент генерируется командой `npm run generate:api`:
1. `swagger2openapi` конвертирует Swagger → OpenAPI 3.0
2. `ng-openapi-gen` генерирует TypeScript типы и функции в `src/app/api/`

> **Не редактировать** файлы в `src/app/api/` вручную — они перезаписываются при регенерации.
