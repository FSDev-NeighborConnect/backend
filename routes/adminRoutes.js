const express = require('express');
const router = express.Router();
const { adminUpdateUser, adminDeleteUser } = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/adminMiddleware');

router.put('/users/:id', authenticate, requireAdmin, adminUpdateUser);
router.delete('/users/:id', authenticate, requireAdmin, adminDeleteUser);

module.exports = router;