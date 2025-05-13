const express = require('express');
const router = express.Router();

const { createEvent } = require('../controllers/eventController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { validateEventCreation } = require('../middleware/validator');


router.use(authenticate);
router.use(csrfProtection);

// ........................
//Create a new Event
router.post('/event', validateEventCreation, createEvent)
// ...................................................
/*
// Get all posts route, authenticates user first
router.get('/all/posts', getAllPosts);

//Get posts by zip
router.get('/zip', getPostsByZip);
// Visit a post 
router.get('/:id', validatePostId, getPostByID)

router.delete('/:id', deletePost);

router.get('/user/:id', getUserPosts);
*/

module.exports = router;