const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please enter a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please enter a description'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['metal', 'plastic', 'cardboard', 'ewaste', 'paper', 'other'],
      required: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: 'General',
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify quantity'],
      min: [0, 'Quantity cannot be negative'],
      validate: {
        validator: function (val) {
          if (this.status === 'sold') {
            return Number.isInteger(val) && val >= 0;
          }
          return Number.isInteger(val) && val > 0;
        },
        message: 'Quantity must be a positive whole number',
      },
    },
    unit: {
      type: String,
      enum: ['kg', 'ton'],
      default: 'kg',
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Please specify price per unit'],
      min: [0.0001, 'Asking price must be positive and non-zero'],
    },
    estimatedPrice: {
      type: Number,
      default: 0,
    },
    condition: {
      type: String,
      enum: ['clean', 'mixed', 'contaminated'],
      default: 'clean',
    },
    images: [
      {
        type: String,
      },
    ],
    city: {
      type: String,
      required: true,
      trim: true,
      default: 'Ahmedabad',
    },
    location: {
      lat: { type: Number, default: 23.0225 },
      lng: { type: Number, default: 72.5714 },
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'removed'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
