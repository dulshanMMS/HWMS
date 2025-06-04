import express from 'express';
import { getAllTeams, addTeam } from '../controllers/teamController.js';

const router = express.Router();

// GET /api/teams - Fetch all team color details from here
router.get('/', getAllTeams);
router.post('/', addTeam);

export default router;
