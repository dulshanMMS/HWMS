import express from "express";
import { addTeam, getAllTeams, getTeamMembers, getTeamMemberCounts, updateTeam, deleteTeam } from '../controllers/teamController.js';

const router = express.Router();

// GET /api/teams
router.get('/teams', getAllTeams);

// POST /api/teams - add a new team
router.post('/teams', addTeam);

// GET /api/teams/:teamId/members
router.get('/teams/:teamId/members', getTeamMembers);

// NEW: GET /api/teams/member-counts
router.get('/teams/member-counts', getTeamMemberCounts);

router.put('/teams/:id', updateTeam);      
router.delete('/teams/:id', deleteTeam);    

export default router;
