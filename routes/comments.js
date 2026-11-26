const express = require('express');
const {
  getComments,
  createComment,
  deleteComment,
} = require('../db/database');

const router = express.Router();

// GET /api/comments?post_id=5
router.get('/', async (req, res, next) => {
  try {
    const { post_id } = req.query;
    let parsedPostId = null;

    if (post_id !== undefined) {
      parsedPostId = Number(post_id);
      if (!Number.isInteger(parsedPostId)) {
        return res.status(400).json({
          error: 'Параметр post_id должен быть целым числом',
        });
      }
    }

    const comments = await getComments(parsedPostId);
    res.json(comments);
  } catch (err) {
    next(err);
  }
});

// POST /api/comments
router.post('/', async (req, res, next) => {
  try {
    const { post_id, author, content } = req.body;

    // Проверка на пустой content -> 400
    if (typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        error: 'Поле content не может быть пустым',
      });
    }

    // Несуществующий post_id допустим (внешний ключ не проверяется), но значение должно быть числом
    const parsedPostId = Number(post_id);
    if (post_id === undefined || post_id === null || post_id === '' || !Number.isInteger(parsedPostId)) {
      return res.status(400).json({
        error: 'Поле post_id обязательно и должно быть целым числом',
      });
    }

    const cleanAuthor =
      typeof author === 'string' && author.trim() !== ''
        ? author.trim()
        : 'Аноним';

    const newComment = await createComment({
      post_id: parsedPostId,
      author: cleanAuthor,
      content: content.trim(),
    });

    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/comments/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const commentId = Number(req.params.id);

    if (!Number.isInteger(commentId)) {
      return res.status(400).json({
        error: 'Некорректный id комментария',
      });
    }

    const deleted = await deleteComment(commentId);

    if (!deleted) {
      return res.status(404).json({
        error: 'Комментарий не найден',
      });
    }

    res.json({
      message: 'Комментарий успешно удалён',
      id: commentId,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;