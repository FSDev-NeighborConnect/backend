const express = require('express');
const router = express.Router();
const { getAllPosts, getPostsByZip, createPost } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');

// Get all posts route, authenticates user first
router.get('/all', authenticate, getAllPosts);

router.get('/zip', authenticate, getPostsByZip);

router.post ('/post', authenticate, createPost )

module.exports = router;