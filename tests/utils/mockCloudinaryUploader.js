const uploadImageToCloudinary = jest.fn(() =>
  Promise.resolve({
    secure_url: 'https://cloudinary.com/fake-image.jpg',
    public_id: 'users/user123/avatarOrCover',
  })
);

module.exports = {
  uploadImageToCloudinary,
};
