const express = require('express');
const router = express.Router();

const {likePost, getLikesCount, getAllPosts, getPostsByZip, createPost, deletePost, getPostByID, getUserPosts } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { validatePostId, validatePostCreation } = require('../middleware/validator');

router.use(authenticate);
router.use(csrfProtection);

// Get all posts route, authenticates user first
router.get('/all/posts', getAllPosts);

//Get posts by zip
router.get('/zip', getPostsByZip);

//Create a new post
router.post('/post', validatePostCreation, createPost)

// Visit a post 
router.get('/:id', validatePostId, getPostByID)

router.delete('/:id', deletePost);

router.get('/user/:id', getUserPosts);

router.post('/:id/like',validatePostId, likePost)
router.get('/likes/:id',validatePostId,  getLikesCount)


module.exports = router;