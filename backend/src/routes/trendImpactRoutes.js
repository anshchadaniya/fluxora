const express = require('express');
const router = express.Router();
const {
  getMyImpact,
  getPlatformImpact,
  getRecyclers,
} = require('../controllers/trendImpactController');
const { protect } = require('../middleware/auth');

router.get('/impact/me', protect, getMyImpact);
router.get('/impact/platform', getPlatformImpact);
router.get('/recyclers', getRecyclers);

module.exports = router;
