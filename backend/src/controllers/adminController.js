const User = require('../models/User');
const Listing = require('../models/Listing');
const Deal = require('../models/Deal');
const Offer = require('../models/Offer');

// @desc    Get system-wide metrics and stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ verificationStatus: 'verified' });
    const pendingUsers = await User.countDocuments({ verificationStatus: 'pending' });

    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const soldListings = await Listing.countDocuments({ status: 'sold' });

    const totalDeals = await Deal.countDocuments();
    const completedDeals = await Deal.find({ status: 'completed' });

    const totalKgRecycled = completedDeals.reduce((sum, d) => sum + (d.impact?.kgRecycled || 0), 0);
    const totalCo2SavedKg = completedDeals.reduce((sum, d) => sum + (d.impact?.co2SavedKg || 0), 0);

    // Category distribution of listings
    const categoryDistribution = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      success: true,
      data: {
        users: { total: totalUsers, verified: verifiedUsers, pending: pendingUsers },
        listings: { total: totalListings, active: activeListings, sold: soldListings },
        deals: { total: totalDeals, completed: completedDeals.length },
        impact: { totalKgRecycled, totalCo2SavedKg },
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users filtered by status
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAdminUsers = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.verificationStatus = status;
    }
    if (role && role !== 'all') {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user verification or block status
// @route   PUT /api/admin/users/:id/:action
// @access  Private (Admin only)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id, action } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (action === 'verify') {
      user.verificationStatus = 'verified';
    } else if (action === 'reject') {
      user.verificationStatus = 'rejected';
    } else if (action === 'block') {
      user.isBlocked = !user.isBlocked; // Toggle block status
    } else {
      return res.status(400).json({ success: false, message: 'Invalid admin action' });
    }

    await user.save();

    res.json({
      success: true,
      message: `User status updated successfully (${action})`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings for moderation
// @route   GET /api/admin/listings
// @access  Private (Admin only)
exports.getAdminListings = async (req, res, next) => {
  try {
    const listings = await Listing.find()
      .populate('seller', 'name email companyName verificationStatus')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate listing (e.g. remove or restore)
// @route   PUT /api/admin/listings/:id/remove
// @access  Private (Admin only)
exports.moderateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    listing.status = listing.status === 'removed' ? 'active' : 'removed';
    await listing.save();

    res.json({
      success: true,
      message: `Listing status updated to ${listing.status}`,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};
