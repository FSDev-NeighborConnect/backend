const express = require('express');
const router = express.Router();

const { getPostsByZip, createPost, deletePost, getPostByID, getUserPosts } = require('../controllers/postController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { validatePostId, validatePostCreation } = require('../middleware/validator');

router.use(authenticate);
router.use(csrfProtection);





//Get posts by zip
router.get('/zip', getPostsByZip);

//Create a new post
router.post('/post', validatePostCreation, createPost)

// Visit a post 
router.get('/:id', validatePostId, getPostByID)

router.delete('/:id', deletePost);

router.get('/user/:id', getUserPosts);

module.exports = router;