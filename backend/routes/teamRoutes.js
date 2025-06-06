import express from "express";
import { addTeam, getAllTeams, getTeamMembers } from '../controllers/teamController.js';

const router = express.Router();

// GET /api/teams
router.get('/teams', getAllTeams);

// POST /api/teams - add a new team
router.post('/teams', addTeam);

// GET /api/teams/:teamId/members
router.get('/teams/:teamId/members', getTeamMembers);

export default router;
