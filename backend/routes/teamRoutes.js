import express from "express";
import Team from "../models/Team.js";

const router = express.Router();

// Existing routes (from your backend)
router.get("/:teamId", async (req, res) => {
  try {
    const team = await Team.findOne({ teamId: req.params.teamId });
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// New route to check if a member exists
router.post("/checkMember", async (req, res) => {
  const { memberId } = req.body;
  try {
    const team = await Team.findOne({ "members.memberId": memberId });
    if (!team) {
      return res.json({ exists: false });
    }
    const member = team.members.find(m => m.memberId === memberId);
    res.json({
      exists: true,
      memberName: member.name,
      teamName: team.teamName,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;