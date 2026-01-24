import express from "express";
import { searchParking , createParking , getMyParkings } from "../controllers/parkingController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

router.get("/search", searchParking);
router.post("/",authMiddleware,  createParking);
router.post("/mine", authMiddleware, getMyParkings);
export default router;
