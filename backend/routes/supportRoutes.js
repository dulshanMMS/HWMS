import express from 'express';
import { submitSupportRequest, getGroupedSupportRequests, markSupportRequestsAsRead } from '../controllers/supportController.js';
import auth from '../middleware/authMiddleware.js'; // Middleware to verify authentication (optional)
import verifyToken, { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /submit
// Endpoint to submit a support request

router.post('/submit', auth, submitSupportRequest);


// GET: Grouped view for admin
router.get("/grouped", verifyToken, isAdmin, getGroupedSupportRequests);
router.post("/mark-as-read", verifyToken, isAdmin, markSupportRequestsAsRead);

export default router;
