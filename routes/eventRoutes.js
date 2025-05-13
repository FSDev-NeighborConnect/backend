const express = require('express');
const router = express.Router();

const { createEvent, getZipEvents, getUserEvents, getEventByID, deleteEvent } = require('../controllers/eventController');
const { authenticate } = require('../middleware/authenticate');
const { csrfProtection } = require('../middleware/csrf');
const { validateEventCreation, 
    validateZipCode, 
    validateUserId, 
    validateEventId,
     } = require('../middleware/validator');


router.use(authenticate);
router.use(csrfProtection);


//Create a new Event
router.post('/event', validateEventCreation, createEvent);
// Get events list based on zip code.
router.get('/zip', validateZipCode, getZipEvents);
// Get the event created
router.get('/user/:id', validateUserId, getUserEvents);
// Visit a Event 
router.get('/:id', validateEventId, getEventByID)


// To delete event based on event id
router.delete('/:id', validateEventId, deleteEvent);


module.exports = router;