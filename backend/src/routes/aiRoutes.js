const express = require('express');
const router = express.Router();
const { getEstimate, classify, parseSearch } = require('../controllers/aiController');

router.post('/estimate-price', getEstimate);
router.post('/classify', classify);
router.post('/parse-search', parseSearch);

module.exports = router;
