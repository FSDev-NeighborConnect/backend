const express = require('express');
const router = express.Router();

const { getAllPosts, getPostsByZip, createPost, deletePost, getPostByID } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');
const { validatePostId, validatePostCreation } = require('../middleware/validator');

// Get all posts route, authenticates user first
router.get('/all/posts', authenticate, getAllPosts);

//Get posts by zip
router.get('/zip', authenticate, getPostsByZip);

//Create a new post
router.post('/post', authenticate, validatePostCreation, createPost)

// Visit a post 
router.get('/:id', authenticate, validatePostId, getPostByID)

router.delete('/:id', authenticate, deletePost);

module.exports = router;