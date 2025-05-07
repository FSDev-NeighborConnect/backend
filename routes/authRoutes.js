const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const {validateLogIn, validateSignUp} = require ('../middleware/validator')


//Sign Up route
router.post('/signup',validateSignUp, registerUser);

// Log in route
router.post('/login', validateLogIn, loginUser)

router.put('/:id', updateUser)

module.exports = router;
