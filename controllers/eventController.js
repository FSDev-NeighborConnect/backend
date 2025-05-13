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
      postalCode, description,hobbies,
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

// Fetch the evets in a particular postal code.
const getZipEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const postalCode = user.postalCode;
    // Find event in DB using postal code  and populate the creator's name
    const events = await Event.find({postalCode}).populate('createdBy', 'name');
    if (events) {
      return res.status(200).json({ events });
    } else {
      return res.status(404).json({ message: 'No Events found in your area!' })
    }
  } catch (err) {
    next(err);
  }
}

// Fetch the posts details created by particular user.
const getUserEvents = async (req, res, next) => {
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

const getEventByID = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    // Find post in DB using post ID received in request and populate the creator's name
    const eventDetails = await Event.findById(eventId).populate('createdBy', 'name');
    if (eventDetails) {
      return res.status(200).json({ eventDetails });
    } else {
      return res.status(404).json({ message: 'Page not found' })
    }

  } catch (err) {
    next(err);
  }
}


const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('createdBy', 'name');  // populates createdBy with User but limits to name only
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events!', error: err.message });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not the owner of this post!' });
    }

    await event.deleteOne();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete event', error: err.message });
  }
};

module.exports = {
    createEvent, 
    getUserEvents, 
    getZipEvents, 
    getEventByID, 
    getAllEvents,
    deleteEvent
};

