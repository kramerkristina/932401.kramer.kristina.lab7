const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'comments.db');
const db = new sqlite3.Database(dbPath);

// Инициализация базы данных и создание таблицы comments
function initDb() {
  return new Promise((resolve, reject) => {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        author TEXT NOT NULL DEFAULT 'Аноним',
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `;

    db.run(createTableSql, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// READ: получение всех комментариев или фильтрация по post_id с сортировкой по дате (новые сверху)
function getComments(postId = null) {
  return new Promise((resolve, reject) => {
    let sql = 'SELECT id, post_id, author, content, created_at FROM comments';
    const params = [];

    if (postId !== null) {
      sql += ' WHERE post_id = ?';
      params.push(postId);
    }

    sql += ' ORDER BY created_at DESC, id DESC';

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// CREATE: добавление нового комментария
function createComment({ post_id, author, content }) {
  return new Promise((resolve, reject) => {
    const createdAt = new Date().toISOString();
    const sql = `
      INSERT INTO comments (post_id, author, content, created_at)
      VALUES (?, ?, ?, ?)
    `;

    db.run(sql, [post_id, author, content, createdAt], function (err) {
      if (err) {
        reject(err);
        return;
      }

      db.get(
        'SELECT id, post_id, author, content, created_at FROM comments WHERE id = ?',
        [this.lastID],
        (selectErr, row) => {
          if (selectErr) {
            reject(selectErr);
          } else {
            resolve(row);
          }
        }
      );
    });
  });
}

// DELETE: удаление комментария по id
function deleteComment(id) {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM comments WHERE id = ?';

    db.run(sql, [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes > 0);
      }
    });
  });
}

module.exports = {
  initDb,
  getComments,
  createComment,
  deleteComment,
};