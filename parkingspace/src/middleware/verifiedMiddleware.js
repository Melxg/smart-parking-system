const verifiedMiddleware = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      message: "Please verify your email to continue.",
    });
  }

  next();
};

export default verifiedMiddleware;
