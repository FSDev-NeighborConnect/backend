const Event = require("../models/Event");
const User = require("../models/User")


const createEvent = async (req, res, next) => {
  try {
    const { eventImage, title, date,
      startTime, endTime, streetAddress,
      postalCode, description, hobbies
    } = req.body;

    // Get user info from DB based on  authenticate.js. 
    // For add security in case user still have the token after deleting user.
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const newEvent = new Event({
      eventImage, title, date,
      startTime, endTime, streetAddress,
      postalCode, description, hobbies,
      createdBy: req.user._id,
    });

    await newEvent.save();
    res.status(201).json({
      message: 'Event created successfully'

    });

  } catch (err) {
    next(err);
  }
}


const getPostsByZip = async (req, res) => {
  try {
    const user = await User.findById(req.user.userID) //to get the current user from DB from data recd. via authenticate next
    const postalCode = user.postalCode;

    const posts = await Post.find({ postalCode }).populate('createdBy', 'name');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts!', error: err.message })
  }
};

// Fetch the posts details created by particular user.
const getEventByUserId = async (req, res, next) => {
  try {
    // Find event in DB using user ID received in request and populate the creator's name
    const eventDetails = await Event.findById(req.user.id).populate('createdBy', 'name');
    if (eventDetails) {
      return res.status(200).json({ eventDetails });
    } else {
      return res.status(404).json({ message: 'No Events created by user!' })
    }
  } catch (err) {
    next(err);
  }
}


module.exports = {createEvent, getEventByUserId};