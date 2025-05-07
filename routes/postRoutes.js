const express = require('express');
const router = express.Router();

const { getAllPosts, getPostsByZip, createPost, getPostById, deletePost } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');
const { validatePostID, validatePostCreation} = require('../middleware/validator');

// Get all posts route, authenticates user first
router.get('/all/posts', authenticate, getAllPosts);

//Get posts by zip
router.get('/zip', authenticate, getPostsByZip);

//Create a new post
router.post ('/post', authenticate, validatePostCreation, createPost)

// Visit a post 
router.get ('/:id', authenticate, validatePostID, getPostById)

router.delete('/:id', authenticate, deletePost);

module.exports = router;