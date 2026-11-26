# Лабораторная работа №7 — «Комментарии к посту»

> REST API для комментариев на SQLite — вложенность через `post_id`, фильтрация и сортировка по дате.

**Студент:** Кристина Крамер · **Группа:** 932401 · **Вариант:** 6

## Что сделано

Бэкенд для системы комментариев по теме варианта №6 — «Комментарии к посту (вложенность через `post_id`)»:

* создание, чтение и удаление комментариев (метод `PUT` намеренно не реализован по условию варианта);
* фильтр `?post_id=5` возвращает только комментарии к указанному посту;
* при создании автоматически проставляется `created_at`;
* нельзя создать комментарий с пустым `content` — сервер отвечает `400`;
* передача несуществующего `post_id` допускается и не считается ошибкой;
* новые комментарии идут сверху.

## Как сделано

| Часть | Реализация |
| :--- | :--- |
| Сервер | Node.js + Express (`server.js`, `routes/comments.js`) |
| База данных | SQLite, пакет `sqlite3`, слой доступа к данным вынесен в `db/database.js` |
| Запросы | только параметризованные ( `?` ), защита от SQL-инъекций |
| Дата создания | проставляется при вставке в формате ISO 8601 через `new Date().toISOString()` |
| Сортировка | `ORDER BY created_at DESC, id DESC` |
| Ошибки | JSON `{ "error": "..." }` и коды 400 / 404 |

Таблица `comments`:

| Поле | Тип |
| :--- | :--- |
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT |
| `post_id` | INTEGER NOT NULL |
| `author` | TEXT NOT NULL DEFAULT 'Аноним' |
| `content` | TEXT NOT NULL |
| `created_at` | TEXT NOT NULL |

API:

| Метод | Путь | Описание | Ответ |
| :--- | :--- | :--- | :--- |
| GET | `/api/comments` | все комментарии ( `?post_id=5` — только для поста 5) | 200 |
| POST | `/api/comments` | создать комментарий | 201 / 400 |
| DELETE | `/api/comments/:id` | удалить комментарий | 200 / 400 / 404 |

## Запуск

```bash
npm install
node server.js
```

## Что получилось

Сценарий проверки: создание комментариев к посту `5` и несуществующему `post_id: 999`, попытка отправить пустой текст, фильтрация и удаление.

```text
POST /api/comments  {"post_id":5,"author":"Kristina","content":"First comment on post 5"}
  -> 201 {"id":1,"post_id":5,"author":"Kristina","content":"First comment on post 5","created_at":"2026-11-26T13:20:10.112Z"}

POST /api/comments  {"post_id":999,"author":"Guest","content":"Comment for non-existent post"}
  -> 201 {"id":3,"post_id":999,"author":"Guest","content":"Comment for non-existent post","created_at":"2026-11-26T13:20:25.408Z"}

POST /api/comments  {"post_id":5,"author":"Kristina","content":"   "}
  -> 400 {"error":"Поле content не может быть пустым"}

DELETE /api/comments/1  -> 200 {"message":"Комментарий успешно удалён","id":1}
DELETE /api/comments/1  -> 404 {"error":"Комментарий не найден"}
```

**Все комментарии** (новые сверху):

![Все комментарии](screenshots/all-comments.png)

**Только к посту 5** ( `?post_id=5` ):

![Комментарии к посту 5](screenshots/filtered-comments.png)