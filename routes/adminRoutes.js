const express = require('express');
const router = express.Router();
const { adminUpdateUser } = require('../controllers/adminController');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/adminMiddleware');

router.put('/users/:id', authenticate, requireAdmin, adminUpdateUser);

module.exports = router;