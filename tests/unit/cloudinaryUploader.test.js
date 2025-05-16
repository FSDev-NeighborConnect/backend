const uploadImageToCloudinary = require('../../utils/cloudinaryUploader');
const cloudinary = require('../../config/cloudinary');

describe('Cloudinary Image Uploader', () => {
  it('resolves with result when upload succeeds', async () => {
    const mockResult = { secure_url: 'fake image here', public_id: 'test123' };

    // overrides real upload_stream() with function returning mockResult in callback
    cloudinary.uploader.upload_stream = jest.fn((options, cb) => {
      const stream = {
        end: () => cb(null, mockResult)
      };
      return stream;
    });

    const buffer = Buffer.from('fake image');
    const result = await uploadImageToCloudinary(buffer, 'test/folder', []);

    expect(result).toEqual(mockResult);
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
  });

  it('rejects with error when upload fails', async () => {
    const mockError = new Error('Upload failed');

    cloudinary.uploader.upload_stream = jest.fn((options, cb) => {
      const stream = {
        end: () => cb(mockError, null)
      };
      return stream;
    });

    const buffer = Buffer.from('bad image');

    await expect(uploadImageToCloudinary(buffer, 'test/folder', [])).rejects.toThrow('Upload failed');
  });
});
