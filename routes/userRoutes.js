const express = require ('express');
const router = express.Router();
const {getUserById} = require ('../controllers/userController');
const {authenticate} = require ('../middleware/authenticate')

// Route to get all users
router.get ('/all/users', authenticate, getUSers);

router.get('/user/:id', authenticate, validateUserId, getUserById);

module.exports = router ;