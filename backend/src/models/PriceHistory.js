const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['metal', 'plastic', 'cardboard', 'ewaste', 'paper', 'other'],
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: String, // Format: 'YYYY-MM' e.g. '2025-10'
      required: true,
    },
    avgPricePerKg: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
