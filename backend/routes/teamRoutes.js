import express from 'express';
import { getAllTeams } from '../controllers/teamController.js';

const router = express.Router();

// GET /api/teams - Fetch all team color details from here
router.get('/', getAllTeams);

export default router;
