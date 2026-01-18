import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import resend from "../config/resend.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existingUser = await User.findOne({ where: { email } });

    // 👇 resend verification if user exists but not verified
    if (existingUser) {
      if (existingUser.is_verified) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const token = uuidv4();
      existingUser.verification_token = token;
      existingUser.token_expires = new Date(Date.now() + 60 * 60 * 1000);
      await existingUser.save();

      const verifyLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

      await resend.emails.send({
        from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
        to: email,
        subject: "Verify your email",
        html: `<a href="${verifyLink}">Verify Email</a>`,
      });

      return res.json({
        message: "Verification email resent",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = uuidv4();

    await User.create({
      email,
      password: hashedPassword,
      verification_token: token,
      token_expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    const verifyLink = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: email,
      subject: "Verify your email",
      html: `<a href="${verifyLink}">Verify Email</a>`,
    });

    res.status(201).json({
      message: "Registration successful. Check your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};





export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      where: {
        verification_token: token,
      },
    });

    if (!user || user.token_expires < new Date())
      return res.status(400).json({ message: "Invalid or expired token" });

    user.is_verified = true;
    user.verification_token = null;
    user.token_expires = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.is_verified)
      return res.status(403).json({
        message: "Please verify your email first",
      });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};
