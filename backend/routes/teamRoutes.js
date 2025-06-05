import express from 'express';
import { getAllTeams, addTeam, getTeamMembers } from '../controllers/teamController.js';

const router = express.Router();

// GET /api/teams - Fetch all team color details from here
router.get('/', getAllTeams);
router.post('/', addTeam);

// GET /api/teams/:teamId/members - Fetch users in a team
router.get('/:teamId/members', getTeamMembers);

export default router;
