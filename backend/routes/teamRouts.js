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

export default router;
