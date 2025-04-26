const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true, // Trims whitespace
    minlength: 5 // Ensure title is at least 5 characters long
  },
  description: {
    type: String,
    required: true,
    minlength: 10
  },
  category: {
    type: [String]
    // enum values to be decided, so field is not required yet
  },
  street: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in progress', 'closed'], // Only these values are allowed
    required: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);