module.exports = jest.fn(async function uploadImageToCloudinary(buffer, folder, transformation) {
  return {
    secure_url: `https://cloudinary.com/${folder}/mocked.jpg`,
    public_id: `${folder}/mocked-public-id`,
  };
});
