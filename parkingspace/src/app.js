import express from "express";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import parkingRoutes from "./routes/parkingRoutes.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/parking", parkingRoutes);
app.use("/search", searchRoutes);
export default app;

