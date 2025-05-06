// Contollers for Authentication of user routes
const User = require('../models/User.js');
const auth = require('../services/authService.js')
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res, next) => {
    // Getting data from react form
    const { name,
        email,
        password,
        status,
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
            return res.status(400).json({ message: "User already exists" });
        }
        // if existingUser is NOT found
        const hashedPassword = await auth.hashPassword(password);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            status,
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
        return res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        next(err); // Send error to error-handling middleware
    }
};

exports.loginUser = async (req, res, next) => {

    try {
        // getting email & password from login react form 
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        // if email exists in DB
        if (existingUser) {
            const userStatus = existingUser.status

            // checks user status if email found in DB.
            if (userStatus === "approval pending") {
                return res.status(409).json({ message: 'Request pending for approval.' })
            }

            if (userStatus === "disqualified") {
                return res.status(403).json({ message: 'Access denied.' })
            }
            // if user found in DB, password matches JWT token generated & sent.
            // Need to be included in .env file JWT_SECRET=yourSuperSecretKey
            if (userStatus === "approved") {
                const pwdMatch = await auth.comparePassword(password, existingUser.password);
                if (pwdMatch) {
                    const { _id: id, email, role } = existingUser;
                    const token = auth.generateToken({ sub: id, role });
                    return res.status(200).json({
                        message: 'Login Successful.',
                        token,
                        user: { id, email, role }
                    });
                } else {
                    return res.status(401).json({ message: 'Incorrect Password.' });
                }
            }
        }
        return res.status(400).json({ message: 'Invalid email !' })
    }
    catch (err) {
        next(err);
    }
}


