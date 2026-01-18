// src/utils/tokens.js
import { v4 as uuidv4 } from "uuid";

export const generateVerificationToken = () => {
  const expires = new Date();
  expires.setHours(expires.getHours() + 24); // 24 hours expiry
  
  return {
    token: uuidv4(),
    expires: expires
  };
};

// Add JWT token generation for login
import jwt from "jsonwebtoken";

export const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};