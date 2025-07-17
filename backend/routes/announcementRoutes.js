import express from "express";
import { createAnnouncement } from "../controllers/announcementController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateUser, createAnnouncement);

export default router;