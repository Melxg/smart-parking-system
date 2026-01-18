import sequelize from "./config/db.js";
import User from "./models/User.js";

(async () => {
  try {
    await sequelize.sync({ alter: true }); // creates/updates tables
    console.log("✅ Database connected & tables synced!");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();
