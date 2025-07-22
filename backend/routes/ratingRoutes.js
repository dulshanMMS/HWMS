import express from 'express';
const router = express.Router();
import { submitRating } from '../controllers/ratingController.js';

router.post('/submit-rating', submitRating);

export default router;