const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 4
  },
  email: {
    type: String,
    required: true,
    unique: true, // One user, one email
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  status: { // Allow manual approval of registration by admin
    type: String,
    enum: ['active', 'pending', 'denied'],
    default: 'pending',
    required: true
  },
  streetAddress: {
    type: String,
    required: true
  },
  postalCode: {
    type: String, // String as postal codes may have letters or leading zeros, confusing numerical value
    required: true
  },
  phone: {
    type: String, // String due to + & leading zeros
    required: true
  },
  avatarUrl: {
    // Todo: Add as required when backend & frontend are ready for handling avatars
    type: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  role: {
    type: String,
    enum: ['member', 'admin'], // Only allow 'member' & 'admin' values
    required: true,
  },
  hobbies: [String]
}, {
  timestamps: true // Auto-creates createdAt & updatedAt
});

module.exports = mongoose.model('User', userSchema);