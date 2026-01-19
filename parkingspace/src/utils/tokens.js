// src/utils/tokens.js
import jwt from "jsonwebtoken";

export const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Removed generateVerificationToken function