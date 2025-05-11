const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 300, height: 300, crop: 'fill' }],
  },
});

const coverStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'covers',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 1000, height: 300, crop: 'fill' }],
  },
});

module.exports = { avatarStorage, coverStorage };