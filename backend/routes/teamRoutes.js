
import express from "express";
import Team from "../models/Team.js";

const router = express.Router();

// Route to fetch all teams
// Returns teamId, teamName, and color fields only (excludes Mongo _id)
// Public route, no authentication required
router.get("/teams", async (req, res) => {
  try {
    const teams = await Team.find({}, { _id: 0, teamId: 1, teamName: 1, color: 1 });
    res.json(teams);
  } catch (err) {
    console.error("Failed to fetch teams:", err);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});


export default router;
