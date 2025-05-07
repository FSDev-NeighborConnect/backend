const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');


//Sign Up route
router.post('/signup', registerUser);

// Log in route
router.post('/login', loginUser)

router.put('/:id', updateUser)

module.exports = router;
