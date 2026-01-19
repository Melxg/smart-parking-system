import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Always true since no verification
  },
  role: {
    type: DataTypes.ENUM("admin", "driver", "owner"),
    allowNull: false,
    defaultValue: "driver",
  },
  // Removed verification_token and token_expires fields
}, {
  timestamps: true,
});

export default User;