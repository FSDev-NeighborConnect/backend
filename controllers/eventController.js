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


module.exports = { createEvent };

