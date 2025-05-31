import express from 'express';
import { submitSupportRequest } from '../controllers/supportController.js';
import auth from '../middleware/authMiddleware.js'; // Middleware to verify authentication (optional)


const router = express.Router();

// POST /submit
// Endpoint to submit a support request

router.post('/submit', auth, submitSupportRequest);

export default router;
