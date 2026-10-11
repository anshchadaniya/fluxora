const express = require('express');
const router = express.Router();
const {
  getListings,
  getNearbyListings,
  getListingById,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

router.get('/', getListings);
router.get('/nearby', getNearbyListings);
router.get('/mine', protect, getMyListings);
router.get('/:id', getListingById);
router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 4), createListing);
router.put('/:id', protect, upload.array('images', 4), updateListing);
router.delete('/:id', protect, deleteListing);

module.exports = router;
