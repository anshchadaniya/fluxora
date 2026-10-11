const express = require('express');
const router = express.Router();
const { getDeals, completeDeal } = require('../controllers/dealController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDeals);
router.put('/:id/complete', protect, completeDeal);

module.exports = router;
