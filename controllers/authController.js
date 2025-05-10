// Contollers for Authentication of user routes
const User = require('../models/User');
const { setAuthCookies } = require('../services/authServices');
const { hashPassword, comparePasswords } = require('../utils/hash');

exports.registerUser = async (req, res, next) => {
  // Getting data from react form
  const { name,
    email,
    password,
    streetAddress,
    postalCode,
    phone,
    avatarUrl,
    bio,
    role,
    hobbies
  } = req.body;

  try {
    // Look if user exists based on email id.
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." }); // need to redirect to home page or login page.
    }
    // if existingUser is NOT found
    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      streetAddress,
      postalCode,
      phone,
      avatarUrl, //optional
      bio, //optional
      role,
      hobbies //optional
    });
    // Saving the new user data to DB.
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully." });

  } catch (err) {
    next(err); // Send error to error-handling middleware
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    // Getting email & password from login form
    const { email, password } = req.body;

    // Find user by email
    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      const pwdMatch = await comparePasswords(password, userExists.password);

      if (pwdMatch) {
        setAuthCookies(userExists);

        res.status(200).json({
          message: "Login successful",
          user: {
            id,
            email: userEmail,
            role
          }
        });

      } else {
        return res.status(400).json({ message: "Invalid credentials." });
      }
    } else {

      // This only runs if no user was found
      return res.status(400).json({ message: "Invalid credentials." });
    }
  } catch (err) {
    next(err);
  }
};