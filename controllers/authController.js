// Contollers for Authentication of user routes
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res, next) => {
    // Getting data from react form
  const {name,
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
    const existingUser = await User.findOne({  email: email.toLowerCase()  });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." }); // need to redirect to home page or login page.
    }
    // if existingUser is NOT found
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        name,
        email,
        password : hashedPassword,
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
        // Optional future logic for status:
        // const userStatus = userExists.status;
        // if (userStatus === "approval pending") {
        //   return res.status(409).json({ message: "Request pending for approval." });
        // }
  
        // if (userStatus === "disqualified") {
        //   return res.status(403).json({ message: "Access denied." });
        // }
  
        const pwdMatch = await bcrypt.compare(password, userExists.password);
  
        if (pwdMatch) {
          const { _id: id, email, role } = userExists;
          const token = jwt.sign({ userId: id, role },
            process.env.JWT_SECRET,{ expiresIn: "1h" });
  
          return res.status(200).json({
            message: "Login Successful.",
            token,
            user: { id, email, role },
          });
        } else {
          return res.status(400).json({ message: "Incorrect Password." });
        }
      } else{
  
      // This only runs if no user was found
      return res.status(400).json({ message: "Invalid email!" });}
    } catch (err) {
      next(err);
    }
  };