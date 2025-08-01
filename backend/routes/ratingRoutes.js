// import express from 'express';
// const router = express.Router();
// import { submitRating } from '../controllers/ratingController.js';

// router.post('/submit-rating', submitRating);

// export default router;

import express from 'express';
const router = express.Router();
import {
  submitRating,
  getAllFeedback,
  updateFeedbackStatus,
  addFeedbackReply,
  exportFeedback
} from '../controllers/ratingController.js';

router.post('/submit-rating', submitRating);
router.get('/feedback', getAllFeedback);
router.put('/feedback/:feedbackId/status', updateFeedbackStatus);
router.put('/feedback/:feedbackId/reply', addFeedbackReply);
router.get('/feedback/export', exportFeedback);

export default router;