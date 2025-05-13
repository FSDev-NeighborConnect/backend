const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventImage: { // Cover image url
    url: {
      type: String,
      default: "https://res.cloudinary.com/dp6nzg4mn/image/upload/event_iz9q6w.webp"
    },

    public_id: {
      type: String,
      default: "event_iz9q6w"
    }
  },

  title: {
    type: String,
    required: true,
    trim: true, // Trims whitespace
    minlength: 5 // Ensure title is at least 5 characters long
  },

  date: {
    type: Date,
    required: true,
  },

  startTime: {
    type: Date,
    required: true
  },

  endTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.startTime;
      },
      message: 'End time must be after the start time.'
    }
  },

  streetAddress: {
    type: String,
    required: true
  },

  postalCode: {
    type: String, // String as postal code is allowed to have alphabets
    required: true
  },

  description: {
    type: String,
    required: true,
    minlength: 10
  },

  hobbies: [String],  // Could be used as category at frontend. So, same as hobbies

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);