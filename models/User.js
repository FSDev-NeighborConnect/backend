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
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
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
  avatar: {  // Avatar image url
    url: String,
    public_id: String
  },
  cover: { // Cover image url
    url: String,
    public_id: String
  },
  bio: {
    type: String,
    maxlength: 500
  },
  role: {
    type: String,
    enum: ['member', 'admin'], // Only allow 'member' & 'admin' values
    required: true,
    default: 'member'
  },
  hobbies: [String]
}, {
  timestamps: true // Auto-creates createdAt & updatedAt
});

module.exports = mongoose.model('User', userSchema);