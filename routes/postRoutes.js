const express = require('express');
const router = express.Router();
const { getAllPosts, getPostsByZip, createPost, getPostById } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');

// Get all posts route, authenticates user first
router.get('/all/posts', authenticate, getAllPosts);

//Get posts by zip
router.get('/zip', authenticate, getPostsByZip);

//Create a new post
router.post ('/post', authenticate, createPost)

// Visit a post 
router.get ('/:id', authenticate, getPostById)

module.exports = router;