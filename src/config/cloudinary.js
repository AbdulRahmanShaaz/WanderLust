const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  cloudinary,
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'Wanderlust',
      allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' },
        { width: 1200, height: 800, crop: 'limit' }
      ],
      eager: [
        { width: 400, height: 300, crop: 'fill', quality: 'auto:eco', fetch_format: 'auto' },
        { width: 1200, height: 800, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }
      ],
      eager_async: true,
      eager_notification_url: null
    },
  }),
};
