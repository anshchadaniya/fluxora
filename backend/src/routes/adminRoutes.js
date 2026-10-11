const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminListings,
  moderateListing,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put('/users/:id/:action', updateUserStatus);
router.get('/listings', getAdminListings);
router.put('/listings/:id/remove', moderateListing);

module.exports = router;
