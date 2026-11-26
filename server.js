const express = require('express');
const { initDb } = require('./db/database');
const commentsRouter = require('./routes/comments');

const app = express();
const PORT = 3000;

app.use(express.json());

// Подключение маршрутов для комментариев
app.use('/api/comments', commentsRouter);

// Обработка несуществующих маршрутов (включая запрещённый PUT)
app.use((req, res) => {
  res.status(404).json({
    error: `Маршрут ${req.method} ${req.originalUrl} не найден`,
  });
});

// Централизованный обработчик ошибок сервера
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
  });
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен: http://localhost:${PORT}`);
      console.log('База данных SQLite и таблица comments готовы к работе.');
    });
  })
  .catch((err) => {
    console.error('Ошибка инициализации базы данных:', err);
    process.exit(1);
  });