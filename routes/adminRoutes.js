const express = require('express');
const router = express.Router();
const { adminUpdateUser, adminDeleteUser, getAllUsers } = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/adminMiddleware');
const adminLogin = require('../controllers/adminAuthController');

router.put('/login', adminLogin);
router.get('/all/users', authenticate, requireAdmin, getAllUsers);
router.put('/users/:id', authenticate, requireAdmin, adminUpdateUser);
router.delete('/users/:id', authenticate, requireAdmin, adminDeleteUser);

module.exports = router;