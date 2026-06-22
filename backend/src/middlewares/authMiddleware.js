const jwt = require('jsonwebtoken');

// Middleware that verifies the JWT token from the Authorization header.
 
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized – no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, department, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized – invalid token' });
  }
};

/**
 * Middleware factory: restricts access to specific roles.
 * Usage: authorize('erp_manager', 'admin')
 * Must be used AFTER the protect middleware.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden – insufficient permissions' });
  }
  next();
};

module.exports = { protect, authorize };