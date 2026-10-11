const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fluxora_dev_secret_change_me');

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or deleted' });
      }

      if (user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
