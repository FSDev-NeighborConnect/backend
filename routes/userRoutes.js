const express = require('express');
const router = express.Router();
const { getUserById, updateUser } = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate')
const { validateUserId } = require('../middleware/validator')


// Route to get user by id
router.get('/user/:id', authenticate, validateUserId, getUserById);

// Update own user
router.put('/:id', authenticate, updateUser)

module.exports = router;
