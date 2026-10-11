const Listing = require('../models/Listing');
const { calculateDistanceKm } = require('../services/distance');
const { estimatePrice } = require('../services/priceEstimator');

// @desc    Get all active listings with filters, search & pagination
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res, next) => {
  try {
    const { search, category, condition, city, minPrice, maxPrice, sort = 'newest', page = 1, limit = 12 } = req.query;

    const query = { status: 'active' };

    // Search keyword in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (category && category !== 'all') {
      query.category = category;
    }
    if (condition && condition !== 'all') {
      query.condition = condition;
    }
    if (city && city !== 'all') {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }
    if (minPrice || maxPrice) {
      query.pricePerUnit = {};
      if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
    }

    // Sort options
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { pricePerUnit: 1 };
    if (sort === 'price_desc') sortOptions = { pricePerUnit: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('seller', 'name companyName phone city verificationStatus')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get listings nearby a specific location (Haversine formula)
// @route   GET /api/listings/nearby
// @access  Public
exports.getNearbyListings = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat) || 23.0225; // Default: Ahmedabad
    const lng = parseFloat(req.query.lng) || 72.5714;
    const radiusKm = parseFloat(req.query.radiusKm) || 100; // Default 100km

    const activeListings = await Listing.find({ status: 'active' })
      .populate('seller', 'name companyName city verificationStatus');

    // Calculate distance for each listing and filter by radius
    const nearby = activeListings
      .map((item) => {
        const itemObj = item.toObject();
        const dist = calculateDistanceKm(
          lat,
          lng,
          item.location?.lat || 23.0225,
          item.location?.lng || 72.5714
        );
        itemObj.distanceKm = dist;
        return itemObj;
      })
      .filter((item) => item.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      center: { lat, lng },
      radiusKm,
      count: nearby.length,
      data: nearby,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing by ID and increment views
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name companyName phone email city state verificationStatus location');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Increment views counter
    listing.views += 1;
    await listing.save();

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's listings
// @route   GET /api/listings/mine
// @access  Private (Seller/Admin)
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new scrap listing
// @route   POST /api/listings
// @access  Private (Seller only)
exports.createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      subCategory,
      quantity,
      unit = 'kg',
      pricePerUnit,
      condition = 'clean',
      city,
      lat,
      lng,
    } = req.body;

    const qtyNum = Number(quantity);
    if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive whole number greater than 0',
      });
    }

    const priceNum = Number(pricePerUnit);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Asking price per unit must be a positive number greater than 0',
      });
    }

    // Handle uploaded images (paths from multer)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => {
        // Cloudinary returns file.path as full URL, local disk returns file.filename
        return file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`;
      });
    }

    // Run AI price estimation for reference if not provided
    let calculatedEstimate = 0;
    try {
      const est = await estimatePrice({ category, subCategory, quantity: Number(quantity), unit, condition });
      calculatedEstimate = est.estimatedPrice;
    } catch (e) {
      calculatedEstimate = Number(pricePerUnit) || 0;
    }

    const listing = await Listing.create({
      seller: req.user._id,
      title,
      description,
      category,
      subCategory: subCategory || 'General',
      quantity: Number(quantity),
      unit,
      pricePerUnit: Number(pricePerUnit),
      estimatedPrice: calculatedEstimate,
      condition,
      images: imageUrls,
      city: city || req.user.city || 'Ahmedabad',
      location: {
        lat: parseFloat(lat) || req.user.location?.lat || 23.0225,
        lng: parseFloat(lng) || req.user.location?.lng || 72.5714,
      },
      status: 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Scrap listing created successfully',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Seller owner or Admin)
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Ownership check
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing' });
    }

    const updates = { ...req.body };

    // Append new images if uploaded
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((f) => (f.path.startsWith('http') ? f.path : `/uploads/${f.filename}`));
      updates.images = [...(listing.images || []), ...newUrls];
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate listing
// @route   DELETE /api/listings/:id
// @access  Private (Seller owner or Admin)
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    // Soft delete by setting status to removed
    listing.status = 'removed';
    await listing.save();

    res.json({
      success: true,
      message: 'Listing marked as removed',
    });
  } catch (error) {
    next(error);
  }
};
