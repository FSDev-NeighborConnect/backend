const User = require('../models/User');
const Post = require('../models/Post');
const { clearAuthCookies } = require('../services/authServices');


// PUT /api/admin/users/:id
const adminUpdateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user!', error: err.message });
  }
};

const adminDeleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    clearAuthCookies(res);  // Deletes auth cookie & token, logs user out
    res.status(200).json({ message: `User ${user.name} successfully deleted!` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user!', error: err.message });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find().select('-password');
    if (allUsers) {
      return res.status(200).json(allUsers)
    } else {
      return res.status(404).json({ message: 'No Users found' });
    }
  } catch (err) {
    next(err);
  }
}

// Admin rights to delete post
const adminDeletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    // Find post in DB using post ID received in request and populate the creator's name
    const deletePost = await Post.findByIdAndDelete(postId);

    if (deletePost) {
      return res.status(200).json({ message: 'Post deleted successfully.' });
    } else {
      return res.status(404).json({ message: 'Post not found.' })
    }
  } catch (err) {
    next(err);
  }
};


module.exports = {
  adminDeleteUser,
  adminUpdateUser,
  getAllUsers,
  adminDeletePost
};