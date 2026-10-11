const express = require('express');
const router = express.Router();
const {
  createOffer,
  getReceivedOffers,
  getSentOffers,
  acceptOffer,
  rejectOffer,
  counterOffer,
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOffer);
router.get('/received', protect, getReceivedOffers);
router.get('/sent', protect, getSentOffers);
router.put('/:id/accept', protect, acceptOffer);
router.put('/:id/reject', protect, rejectOffer);
router.put('/:id/counter', protect, counterOffer);

module.exports = router;
