const cloudinary = require('../config/cloudinary');

async function deleteCloudinaryImage(public_id) {
  if (!public_id || public_id === 'event_iz9q6w') return;

  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.warn(`Cloudinary image deletion failed [${public_id}]:`, err.message);
  }
}

module.exports = deleteCloudinaryImage;