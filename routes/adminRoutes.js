const express = require('express');
const router = express.Router();
const {
  adminUpdateUser,
  adminDeleteUser,
  getAllUsers,
  adminDeletePost,
  adminUpdatePost,
  adminCreateUser,
  getAllPosts,
  getAllEvents,
  adminDeleteEvent,
  adminUpdateEvent
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { adminLogin } = require('../controllers/adminAuthController');
const { validatePostId, validateGetAllUsers } = require('../middleware/validator');


router.post('/login', adminLogin);  // declared before middleware

router.use(authenticate, csrfProtection, requireAdmin);

router.get('/all/users', getAllUsers);
router.put('/events/:id', adminUpdateEvent);
router.put('/users/:id', adminUpdateUser);
router.put('/posts/:id', adminUpdatePost);
router.delete('/events/:id', adminDeleteEvent);
router.delete('/users/:id', adminDeleteUser);
router.delete('/posts/:id', validatePostId, adminDeletePost);
router.post('/users/create', adminCreateUser);

// Get all events route, authenticates user first
router.get('/all/events', validateGetAllUsers, getAllEvents);
// Get all posts route, authenticates user first
router.get('/all/posts', getAllPosts);


module.exports = router;