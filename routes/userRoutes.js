const express = require('express');
const router = express.Router();
const {
  getUserById,
  updateUser,
  getUsersByZip,
  deleteUser,
  getCurrentUser
} = require('../controllers/userController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { validateUserId, validateZipCode } = require('../middleware/validator');
const upload = require('../middleware/upload');
const { uploadAvatarImage, uploadCoverImage } = require('../controllers/userController');

router.use(authenticate);
router.use(csrfProtection);

// Route to get user by id
router.get('/user/:id', validateUserId, getUserById);
// Update own user
router.put('/:id', updateUser);
router.get('/zip/:zip', validateZipCode, getUsersByZip);
router.delete('/:id', deleteUser);
router.post('/upload-avatar', upload.single('avatar'), uploadAvatarImage);
router.post('/upload-cover', upload.single('cover'), uploadCoverImage);
router.get('/currentUser', getCurrentUser);

router.get('/me', getCurrentUser);

module.exports = router;