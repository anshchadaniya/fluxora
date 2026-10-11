const Deal = require('../models/Deal');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const { calculateImpact } = require('../services/impact');

// @desc    Get user's deals (or all for admin)
// @route   GET /api/deals
// @access  Private
exports.getDeals = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'admin') {
      query = {};
    } else {
      query = {
        $or: [{ seller: req.user._id }, { buyer: req.user._id }],
      };
    }

    const deals = await Deal.find(query)
      .populate('listing', 'title category unit pricePerUnit city images')
      .populate('seller', 'name companyName phone email city')
      .populate('buyer', 'name companyName phone email city')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deals.length,
      data: deals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark deal as completed and calculate verified environmental impact
// @route   PUT /api/deals/:id/complete
// @access  Private (Seller or Admin)
exports.completeDeal = async (req, res, next) => {
  try {
    const deal = await Deal.findById(req.params.id).populate('listing');
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const isSeller = deal.seller.toString() === req.user._id.toString();
    if (!isSeller && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the seller or admin can mark a deal as completed' });
    }

    if (deal.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Deal is already marked as completed' });
    }

    // Calculate final environmental impact
    const category = deal.listing?.category || 'metal';
    const unit = deal.listing?.unit || 'kg';
    const impact = calculateImpact(category, deal.quantity, unit);

    deal.status = 'completed';
    deal.impact = {
      kgRecycled: impact.kgRecycled,
      co2SavedKg: impact.co2SavedKg,
    };
    deal.completedAt = new Date();
    await deal.save();

    // Notify buyer
    await Notification.create({
      user: deal.buyer,
      text: `Deal for "${deal.listing?.title}" is completed! Saved ${impact.co2SavedKg} kg of CO₂ emissions.`,
      link: '/deals',
    });

    res.json({
      success: true,
      message: 'Deal completed successfully! Environmental impact updated.',
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};
