// Contollers for Authentication of user routes
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
            return res.status(400).json({ message: "User already exists" });
        }
        // if existingUser is NOT found
        const hashedPassword = await bcrypt.hash(password, 10);
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
                const pwdMatch = await bcrypt.compare(password, existingUser.password);
                if (pwdMatch) {
                    const { _id: id, email, role } = existingUser;
                    const token = jwt.sign(
                        { userId: id, role },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' });

                    return res.status(200).json({
                        message: 'Login Successful.',
                        token,
                        user: { id, email, role }
                    });
                } else {
                    return res.status(400).json({ message: 'Incorrect Password.' });
                }
            }
        }
        return res.status(400).json({ message: 'Invalid email !' })
    }
    catch (err) {
        next(err);
    }
}

exports.updateUser = async (req, res) => {
    const { id } = req.params;

    // blocks if requesting user's id (from token) is not same as target user id
    if (req.user.id !== id) {
        return res.status(403).json({ message: 'You can only update your own profile!' });
    }

    try {
        const updates = req.body;
        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) return res.status(404).json({ message: 'User not found!' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: err.message });
    }
};
