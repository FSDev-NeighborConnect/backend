const express = require ('express');
const router = express.Router();
const {getUsers} = require ('../controllers/userController');
const {authenticate} = require ('../middleware/authenticate')

// Route to get all users
router.get ('/all/users', authenticate, getUSers);

module.exports = router ;