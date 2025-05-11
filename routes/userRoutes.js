const express = require('express');
const router = express.Router();
const { getUserById, updateUser, getUsersByZip } = require('../controllers/userController');
const { getAllUsers } = require('../controllers/adminController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { validateUserId, validateGetAllUsers, validateZipCode } = require('../middleware/validator');

router.use(authenticate);
router.use(csrfProtection);

// Route to get all users, admin only
router.get('/all/users', requireAdmin, validateGetAllUsers, getAllUsers);

// Route to get user by id
router.get('/user/:id', validateUserId, getUserById);

// Update own user
router.put('/:id', updateUser);

router.get('/zip/:zip', validateZipCode, getUsersByZip);

module.exports = router;