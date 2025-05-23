const express = require('express');
const router = express.Router();

const { createEvent, getZipEvents, getUserEvents, getEventByID, deleteEvent, rsvpToEvent, likeEvent } = require('../controllers/eventController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { validateEventCreation,
    validateZipCode,
    validateUserId,
    validateEventId,
} = require('../middleware/validator');
const upload = require('../middleware/upload');


router.use(authenticate);
router.use(csrfProtection);


//Create a new Event
router.post('/event', upload.single('eventImage'), createEvent);
// Get events list based on zip code.
router.get('/zip', getZipEvents);
// Get the event created
router.get('/user/:id', validateUserId, getUserEvents);
// Visit a Event 
router.get('/:id', validateEventId, getEventByID)
// Like an event
router.post('/:id/like', validateEventId, likeEvent);


// To delete event based on event id
router.delete('/:id', validateEventId, deleteEvent);
router.post('/events/:eventId/rsvp', rsvpToEvent);


module.exports = router;