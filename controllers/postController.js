const Post = require("../models/Post");
const User = require("../models/User")

const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('createdBy', 'name');  // populates createdBy with User but limits to name only
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts!', error: err.message });
  }
};


const getPostsByZip = async (req, res) => {
  try {
    const user = await User.findById(req.user.id) //to get the current user from DB from data recd. via authenticate next
    const postalCode = user.postalCode;

    const posts = await Post.find({ postalCode }).populate('createdBy', 'name');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts!', error: err.message })
  }
};


const createPost = async (req, res) => {
  try {
    const { title, description, category, status } = req.body;

    // Get user info from DB based on  authenticate.js
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get Street and postal code from user object
    const street = user.streetAddress;
    const postalCode = user.postalCode;

    const newPost = new Post({
      title, description, category, street,
      postalCode, status, createdBy: user._id
    });

    // in case need to return this const savedPost = 
    await newPost.save();
    res.status(201).json({
      message: 'Post created successfully'
      // , post: savedPost (in case need to return post.)
    });

  } catch (err) {
    next(err);
  }
}

const getPostByID = async (req, res, next) => {
  try {
    const postId = req.params.id;
    // Find post in DB using post ID received in request and populate the creator's name
    const postDetails = await Post.findById(postId).populate('createdBy', 'name');
    if (postDetails) {
      return res.status(200).json({ postDetails });
    } else {
      return res.status(404).json({ message: 'Page not found' })
    }

  } catch (err) {
    next(err);
  }
}

const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the owner of this post!' });
    }

    await post.deleteOne();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post', error: err.message });
  }
};

const getUserPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const posts = await Post.find({ createdBy: userId });

    if (!posts.length) {
      return res.status(404).json({ message: 'No posts found' });
    }

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve posts', error: err.message });
  }
}


module.exports = { getAllPosts, deletePost, getPostsByZip, createPost, getPostByID, getUserPosts };