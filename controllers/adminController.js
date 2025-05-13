const User = require('../models/User');
const Post = require('../models/Post');
const { clearAuthCookies } = require('../services/authServices');
const { hashPassword } = require('../utils/hash');


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

const adminUpdatePost = async (req, res) => {
  const postId = req.params.id;
  const updates = req.body;

  try {
    const updatePost = await Post.findByIdAndUpdate(postId, updates, { new: true });

    if (!updatePost) {
      return res.status(404).json({ message: 'Post not found!' });
    }

    return res.status(200).json({ message: 'Post updated' }, updatePost);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update post!', error: error.message });
  }
}

const adminCreateUser = async (req, res, next) => {
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
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      streetAddress,
      postalCode,
      phone,
      avatarUrl,
      bio,
      role,
      hobbies
    });

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    next(err);
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('createdBy', 'name');  // populates createdBy with User but limits to name only
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts!', error: err.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name');  // populates createdBy with User but limits to name only
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events!', error: err.message });
  }
};

module.exports = {
  adminDeleteUser,
  adminUpdateUser,
  getAllUsers,
  adminDeletePost,
  adminUpdatePost,
  adminCreateUser,
  getAllEvents,
  getAllPosts
};