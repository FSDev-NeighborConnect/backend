const express = require('express');
const router = express.Router();
const { getUserById, getAllUsers, updateUser } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate')
const requireAdmin = require('../middleware/adminMiddleware');
const { validateUserId, validateGetAllUsers } = require('../middleware/validator');

// Route to get all users
router.get ('/all/users', authenticate, requireAdmin, validateGetAllUsers, getAllUsers);

// Route to get user by id
router.get('/user/:id', authenticate, validateUserId, getUserById);

// Update own user
router.put('/:id', authenticate, updateUser);

module.exports = router;