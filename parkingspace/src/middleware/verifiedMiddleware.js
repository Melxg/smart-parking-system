// verifiedMiddleware.js (modified)
const verifiedMiddleware = (req, res, next) => {
  // Since all users are automatically verified, just continue
  next();
};

export default verifiedMiddleware;