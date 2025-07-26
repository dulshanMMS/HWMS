import express from 'express';
import { sendAdminPromotionEmail } from '../controllers/emailController.js';

const router = express.Router();

router.post('/send', sendAdminPromotionEmail);

export default router;
