const Offer = require('../models/Offer');
const Listing = require('../models/Listing');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const { calculateImpact } = require('../services/impact');

// @desc    Make an offer on a listing
// @route   POST /api/offers
// @access  Private (Buyer/Seller)
exports.createOffer = async (req, res, next) => {
  try {
    const { listingId, offeredPrice, quantity, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This listing is no longer available for offers' });
    }

    // Security check: cannot offer on own listing
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot make an offer on your own listing' });
    }

    const offerQty = Number(quantity) || listing.quantity;
    if (offerQty <= 0) {
      return res.status(400).json({ success: false, message: 'Please specify a valid quantity greater than 0' });
    }
    if (offerQty > listing.quantity) {
      return res.status(400).json({
        success: false,
        message: `Offered quantity (${offerQty} ${listing.unit}) cannot exceed available quantity of ${listing.quantity} ${listing.unit}`,
      });
    }

    const offer = await Offer.create({
      listing: listing._id,
      buyer: req.user._id,
      seller: listing.seller,
      offeredPrice: Number(offeredPrice),
      quantity: offerQty,
      message: message || '',
      status: 'pending',
    });

    // Notify seller
    await Notification.create({
      user: listing.seller,
      text: `New offer of ₹${offeredPrice}/${listing.unit} received from ${req.user.name} for "${listing.title}"`,
      link: '/seller/offers',
    });

    res.status(201).json({
      success: true,
      message: 'Offer submitted successfully',
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get offers received by seller
// @route   GET /api/offers/received
// @access  Private
exports.getReceivedOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ seller: req.user._id })
      .populate('listing', 'title category unit pricePerUnit city images status')
      .populate('buyer', 'name companyName phone email city verificationStatus')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get offers sent by buyer
// @route   GET /api/offers/sent
// @access  Private
exports.getSentOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ buyer: req.user._id })
      .populate('listing', 'title category unit pricePerUnit city images status')
      .populate('seller', 'name companyName phone city verificationStatus')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an offer or counter offer -> handles buyer counter acceptance and seller final deal creation
// @route   PUT /api/offers/:id/accept
// @access  Private (Buyer or Seller)
exports.acceptOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('listing');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Offer has already been accepted and finalized' });
    }
    if (offer.status === 'rejected') {
      return res.status(400).json({ success: false, message: 'Offer has been declined and cannot be accepted' });
    }

    const isSeller = offer.seller.toString() === req.user._id.toString();
    const isBuyer = offer.buyer.toString() === req.user._id.toString();

    // CASE 1: Buyer accepts the seller's counter offer
    if (isBuyer) {
      if (offer.status !== 'countered') {
        return res.status(400).json({
          success: false,
          message: 'Only countered proposals can be accepted by the buyer',
        });
      }

      offer.status = 'counter_accepted';
      await offer.save();

      const agreedPrice = offer.counterPrice || offer.offeredPrice;

      // Notify seller that buyer accepted their counter proposal
      await Notification.create({
        user: offer.seller,
        text: `${req.user.name} accepted your counter rate of ₹${agreedPrice}/${offer.listing?.unit || 'kg'} for "${offer.listing?.title}". Please confirm to finalize the deal or decline.`,
        link: '/seller/offers',
      });

      return res.json({
        success: true,
        message: 'Counter offer accepted! The seller has been notified to confirm or decline the deal.',
        data: offer,
      });
    }

    // CASE 2: Seller accepts (or confirms deal after counter accepted or initial/re-counter bid)
    if (isSeller || req.user.role === 'admin') {
      // Find and check listing
      const listing = await Listing.findById(offer.listing._id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Associated scrap listing not found' });
      }

      if (offer.quantity > listing.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot accept offer: requested quantity (${offer.quantity} ${listing.unit}) exceeds available stock (${listing.quantity} ${listing.unit})`,
        });
      }

      // Mark offer as accepted
      offer.status = 'accepted';
      await offer.save();

      // Deduct purchased quantity: remaining goods remain visible on marketplace with updated weight!
      const remainingQty = listing.quantity - offer.quantity;
      if (remainingQty > 0) {
        listing.quantity = remainingQty;
        listing.status = 'active'; // Remains active on marketplace with updated remaining weight!
      } else {
        listing.quantity = 0;
        listing.status = 'sold'; // Completely sold out
      }
      await listing.save();

      // Final agreed price: counterPrice if present, else original offeredPrice
      const agreedFinalPrice = offer.counterPrice || offer.offeredPrice;

      // Initial impact estimation
      const impactCalc = calculateImpact(listing.category, offer.quantity, listing.unit);

      // Create confirmed Deal
      const deal = await Deal.create({
        listing: listing._id,
        offer: offer._id,
        seller: offer.seller,
        buyer: offer.buyer,
        finalPrice: agreedFinalPrice,
        quantity: offer.quantity,
        status: 'confirmed',
        impact: {
          kgRecycled: impactCalc.kgRecycled,
          co2SavedKg: impactCalc.co2SavedKg,
        },
      });

      // Notify buyer
      await Notification.create({
        user: offer.buyer,
        text: `Deal confirmed! Your purchase for "${listing.title}" is finalized at ₹${agreedFinalPrice}/${listing.unit}. Transaction slip is generated.`,
        link: '/deals',
      });

      const successMessage =
        remainingQty > 0
          ? `Deal confirmed! ${offer.quantity} ${listing.unit} sold. Remaining ${remainingQty} ${listing.unit} is active on the marketplace.`
          : `Deal confirmed! All ${offer.quantity} ${listing.unit} sold out. Listing marked as completed.`;

      return res.json({
        success: true,
        message: successMessage,
        data: { offer, deal, remainingQuantity: remainingQty },
      });
    }

    return res.status(403).json({ success: false, message: 'Not authorized to accept this offer' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject / decline an offer
// @route   PUT /api/offers/:id/reject
// @access  Private (Seller or Buyer)
exports.rejectOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('listing');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const isSeller = offer.seller.toString() === req.user._id.toString();
    const isBuyer = offer.buyer.toString() === req.user._id.toString();

    if (!isSeller && !isBuyer && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this offer' });
    }

    offer.status = 'rejected';
    await offer.save();

    const targetUserId = isSeller ? offer.buyer : offer.seller;
    await Notification.create({
      user: targetUserId,
      text: `Offer negotiation for "${offer.listing?.title || 'Listing'}" was declined by ${req.user.name}.`,
      link: isSeller ? '/buyer/offers' : '/seller/offers',
    });

    res.json({
      success: true,
      message: 'Offer declined successfully',
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Counter an offer with a proposed price or stay on same deal
// @route   PUT /api/offers/:id/counter
// @access  Private (Seller or Buyer)
exports.counterOffer = async (req, res, next) => {
  try {
    const { counterPrice, stayOnOriginal } = req.body;

    const offer = await Offer.findById(req.params.id).populate('listing');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const isSeller = offer.seller.toString() === req.user._id.toString();
    const isBuyer = offer.buyer.toString() === req.user._id.toString();

    if (!isSeller && !isBuyer && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to counter this offer' });
    }

    let finalPrice;
    if (stayOnOriginal) {
      finalPrice = offer.offeredPrice;
    } else {
      finalPrice = Number(counterPrice);
      if (isNaN(finalPrice) || finalPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Please provide a valid positive counter price' });
      }
    }

    offer.status = 'countered';
    offer.counterPrice = finalPrice;
    offer.lastCounterBy = isSeller ? 'seller' : 'buyer';
    await offer.save();

    // Notify the other party
    const targetUserId = isSeller ? offer.buyer : offer.seller;
    const notificationMessage = stayOnOriginal
      ? `${req.user.name} chose to stay on the initial bid of ₹${finalPrice}/${offer.listing?.unit || 'kg'} for "${offer.listing?.title}"`
      : `${req.user.name} proposed a counter rate of ₹${finalPrice}/${offer.listing?.unit || 'kg'} for "${offer.listing?.title}"`;

    await Notification.create({
      user: targetUserId,
      text: notificationMessage,
      link: isSeller ? '/buyer/offers' : '/seller/offers',
    });

    res.json({
      success: true,
      message: stayOnOriginal ? 'Reaffirmed original bid to seller' : 'Counter offer sent successfully',
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};
