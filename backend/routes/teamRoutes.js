import express from "express";
import Team from "../models/Team.js";

const router = express.Router();

// POST - Create a new team
router.post("/create", async (req, res) => {
  const { teamName, teamColor, members } = req.body;

  try {
    const newTeam = new Team({ teamName, teamColor, members });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(400).json({ error: "Failed to create team" });
  }
});

// GET - Get all teams
router.get("/", async (req, res) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

// POST - Check if a member exists and fetch their details
router.post("/checkMember", async (req, res) => {
  const { memberId } = req.body;

  try {
    // Find a team that has a member with the given memberId
    const team = await Team.findOne({ "members.memberId": memberId });

    if (!team) {
      return res.json({ exists: false });
    }

    // Find the specific member in the team's members array
    const member = team.members.find(m => m.memberId === memberId);

    if (!member) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      memberName: member.name,
      teamName: team.teamName,
      teamColor: team.teamColor,
      role: member.role
    });
  } catch (error) {
    console.error("Error checking member:", error);
    res.status(500).json({ error: "Failed to check member" });
  }
});

export default router;