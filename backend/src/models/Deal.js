const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['confirmed', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    impact: {
      kgRecycled: {
        type: Number,
        default: 0,
      },
      co2SavedKg: {
        type: Number,
        default: 0,
      },
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deal', dealSchema);
