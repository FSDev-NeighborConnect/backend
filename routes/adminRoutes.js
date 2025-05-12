const express = require('express');
const router = express.Router();
const {
  adminUpdateUser,
  adminDeleteUser,
  getAllUsers,
  adminDeletePost,
  adminUpdatePost,
  adminCreateUser
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { adminLogin } = require('../controllers/adminAuthController');
const { validatePostId } = require('../middleware/validator');

router.post('/login', adminLogin);  // declared before middleware

router.use(authenticate, csrfProtection, requireAdmin);

router.get('/all/users', getAllUsers);
router.put('/users/:id', adminUpdateUser);
router.put('/posts/:id', adminUpdatePost);
router.delete('/users/:id', adminDeleteUser);
router.delete('/posts/:id', validatePostId, adminDeletePost);
router.post('/users/create', adminCreateUser);

module.exports = router;