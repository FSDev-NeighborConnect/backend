const express = require('express');
const router = express.Router();
const { getAllPosts } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');

// Get all posts route, authenticates user first
router.post('/', authenticate, getAllPosts);

module.exports = router;