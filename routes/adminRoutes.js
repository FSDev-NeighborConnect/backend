const express = require('express');
const router = express.Router();
const { adminUpdateUser, adminDeleteUser, getAllUsers, adminDeletePost } = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/adminMiddleware');
const { adminLogin } = require('../controllers/adminAuthController');
const { validatePostId } = require('../middleware/validator');

router.post('/login', adminLogin);
router.get('/all/users', authenticate, requireAdmin, getAllUsers);
router.put('/users/:id', authenticate, requireAdmin, adminUpdateUser);
router.delete('/users/:id', authenticate, requireAdmin, adminDeleteUser);
router.delete('/posts/:id', authenticate, requireAdmin, validatePostId, adminDeletePost);

module.exports = router;