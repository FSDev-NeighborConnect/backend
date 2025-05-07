const express = require('express');
const router = express.Router();
const { deletePost } = require('../controllers/postController');
const authenticate = require('../middleware/authenticate');

router.delete('/:id', authenticate, deletePost);

module.exports = router;