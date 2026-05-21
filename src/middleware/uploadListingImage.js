const multer = require('multer');
const { storage } = require('../config/cloudinary');

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image files are allowed.'), false);
};

module.exports = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max, reasonable limit
  }
});
