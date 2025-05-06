import express from "express";
import Team from "../Models/Teams.js"; // ✅ ESM import

const router = express.Router();

router.get("/", (req, res) => {
  res.send("welcome");
});

router.get("/hello", (req, res) => {
  res.send("Hello user");
});

// router.get('/createTeams', async (req, res) => {
//   try {
//     const sampleTeams = [
//       { teamId: "T001", teamName: "Team A", color: "bg-red-500" },
//       ...
//     ];

//     await Team.insertMany(sampleTeams);

//     res.status(201).json({ message: "Teams created successfully!" });
//   } catch (error) {
//     console.error("Error creating teams:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

export default router;
