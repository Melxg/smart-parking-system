import app from "./app.js";
import sequelize from "./config/db.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("🔥 Server running & DB connected on port", PORT);
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
});
