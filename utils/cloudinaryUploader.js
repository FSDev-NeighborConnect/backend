const cloudinary = require('../config/cloudinary');

const uploadImageToCloudinary = (fileBuffer, folderPath, transformation) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        transformation,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

module.exports = uploadImageToCloudinary;