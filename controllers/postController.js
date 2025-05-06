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


exports.getPostsByZip = async (req, res) =>{
    try {
        const user = await User.findById (req.user.userID) //to get the current user from DB from data recd. via authenticate next
        const postalCode = user.postalCode;

        const posts = await Post.find({postalCode}).populate ('createdBy', 'name');
        res.status(200).json(posts);
    } catch (err){
        res.status(500).json({message : 'Failed to fetch posts!', error : err.message})
    }
};


exports.createPost = async (req, res) => {
  try {
    const { title, description, category, status } = req.body;

    // Get user info from authenticate.js
    const user = req.user;

    // Get Street and postal code from user object
    const street  = user.streetAddress ;
    const postalCode = user.postalCode ;

    const newPost = new Post ({title, description, category, street,
      postalCode, status, createdBy: user._id });
    
      // in case need to return this const savedPost = 
     await newPost.save ();
    res.status(201).json({message : 'Post created successfully'
      // , post: savedPost (in case need to return post.)
    });
  
  } catch (err) {
    next (err);
  }
}


module.exports = getAllPosts;