const multer = require('multer');
const { avatarStorage, coverStorage } = require('../config/cloudinaryStorage');

const uploadAvatar = multer({ storage: avatarStorage });
const uploadCover = multer({ storage: coverStorage });

module.exports = { uploadAvatar, uploadCover };