const User = require('../models/User');
const { clearAuthCookies } = require('../services/authServices');

const getUserById = async (req, res, next) => {
    try {
        const userId = req.params.id; // Get user Id from request
        const user = await User.findById(userId).select('-password');
        if (user) {
            return res.status(200).json(user)
        } else {
            return res.status(404).json({ message: 'User not found' })
        }
    } catch (err) {
        next(err);
    }
}

const updateUser = async (req, res) => {
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

async function getUsersByZip(req, res) {
    try {
        const { zip } = req.params;
        const users = await User.find({ postalCode: zip });
        if (!users.length) {
            return res.status(404).json({ message: 'No users found in this zip code' });
        }
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

async function deleteUser(req, res) {
    const { userId } = req.params;
    try {
        const user = User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }

        clearAuthCookies(res);  // Deletes auth cookie & token, logs user out
        return res.status(200).json({ message: `User ${user.name} has been deleted.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user!', error: err.message });
    }
}

const uploadAvatarImage = async (req, res) => {
    try {
        const imageUrl = req.file.path;
        const userId = req.user.id;

        await User.findByIdAndUpdate(userId, { avatarUrl: imageUrl });
        res.status(200).json({ message: 'Avatar uploaded', url: imageUrl });
    } catch (err) {
        res.status(500).json({ error: 'Avatar upload failed' });
    }
};

const uploadCoverImage = async (req, res) => {
    try {
        const imageUrl = req.file.path;
        const userId = req.user.id;

        await User.findByIdAndUpdate(userId, { coverUrl: imageUrl });
        res.status(200).json({ message: 'Cover uploaded', url: imageUrl });
    } catch (err) {
        res.status(500).json({ error: 'Cover upload failed' });
    }
};


module.exports = { getUserById, updateUser, getUsersByZip, deleteUser, uploadAvatarImage, uploadCoverImage };