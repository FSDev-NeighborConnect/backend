const express = require('express');
const router = express.Router();
const { getUserById, updateUser, getUsersByZip, deleteUser } = require('../controllers/userController');
const { getAllUsers } = require('../controllers/adminController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { validateUserId, validateGetAllUsers, validateZipCode } = require('../middleware/validator');
const upload = require('../middleware/upload');
const { uploadAvatarImage, uploadCoverImage } = require('../controllers/userController');

router.use(authenticate);
router.use(csrfProtection);

// Route to get all users, admin only
router.get('/all/users', requireAdmin, validateGetAllUsers, getAllUsers); // Route is mounted on /api/users, no need for /all/users
// Route to get user by id
router.get('/user/:id', validateUserId, getUserById);
// Update own user
router.put('/:id', updateUser);
router.get('/zip/:zip', validateZipCode, getUsersByZip);
router.delete('/:id', deleteUser);
router.post('/upload-avatar', authenticate, upload.single('avatar'), uploadAvatarImage);
router.post('/upload-cover', authenticate, upload.single('cover'), uploadCoverImage);

module.exports = router;