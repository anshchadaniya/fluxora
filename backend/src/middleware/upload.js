const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local storage engine
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'listing-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter: accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP) are allowed!'), false);
  }
};

let storage = diskStorage;

// If Cloudinary credentials are provided, use Cloudinary storage
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'fluxora/listings',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      },
    });
  } catch (err) {
    console.warn('Cloudinary initialization failed, falling back to local disk storage:', err.message);
    storage = diskStorage;
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: fileFilter,
});

module.exports = upload;
