const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['seller', 'buyer', 'admin'],
      default: 'seller',
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'],
    },
    city: {
      type: String,
      trim: true,
      default: 'Ahmedabad',
    },
    state: {
      type: String,
      trim: true,
      default: 'Gujarat',
    },
    location: {
      lat: { type: Number, default: 23.0225 },
      lng: { type: Number, default: 72.5714 },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
