import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Determine role
    const role = email === process.env.ADMIN_EMAIL ? "admin" : "driver";

    await User.create({
      email,
      password: hashedPassword,
      role,
      is_verified: true, // Automatically verified without email verification
    });

    res.status(201).json({
      message: "Registration successful. You can now login.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    // No email verification check - user is automatically verified
    
    // Role handling for admin vs regular users
    if (user.role === "admin") {
      // Admin can't change role
    } else {
      if (!["driver", "owner"].includes(role)) {
        return res.status(400).json({
          message: "Invalid role selection",
        });
      }

      // Update role if different
      if (user.role !== role) {
        user.role = role;
        await user.save();
      }
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// Remove verifyEmail function entirely