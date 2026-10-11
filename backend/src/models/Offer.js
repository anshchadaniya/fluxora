const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Please enter offered price per unit'],
      min: [0, 'Offered price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please enter quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'countered', 'counter_accepted'],
      default: 'pending',
    },
    counterPrice: {
      type: Number,
      default: null,
    },
    lastCounterBy: {
      type: String,
      enum: ['buyer', 'seller', null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
