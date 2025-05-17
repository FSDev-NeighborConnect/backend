const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createComment,
  getCommentsByPost,
  deleteComment
} = require('../controllers/commentController');

const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { validateCommentId, validateCommentCreation } = require('../middleware/validator');

router.use(authenticate);
router.use(csrfProtection);

router.post('/', validateCommentCreation, createComment); // receives postId from route parameters
router.get('/', getCommentsByPost);
router.delete('/:id', validateCommentId, deleteComment);

module.exports = router;
