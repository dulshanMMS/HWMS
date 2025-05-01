const express = require('express');
const router = express.Router();

router.get("/",(req,res)=>{
    res.send("welcome");
});

router.get("/hello",(req,res)=>{
    res.send("Hello user");
});

const Team = require('../Models/Teams');

// router.get('/createTeams', async (req, res) => {
//   try {
//     const sampleTeams = [
//       { teamId: "T001", teamName: "Team A", color: "bg-red-500" },
//       { teamId: "T002", teamName: "Team B", color: "bg-blue-500" },
//       { teamId: "T003", teamName: "Team C", color: "bg-green-500" },
//       { teamId: "T004", teamName: "Team D", color: "bg-yellow-500" },
//       { teamId: "T005", teamName: "Team E", color: "bg-purple-500" },
//       { teamId: "T006", teamName: "Team F", color: "bg-pink-500" },
//       { teamId: "T007", teamName: "Team G", color: "bg-indigo-500" },
//       { teamId: "T008", teamName: "Team H", color: "bg-teal-500" },
//       { teamId: "T009", teamName: "Team I", color: "bg-orange-500" },
//       { teamId: "T010", teamName: "Team J", color: "bg-cyan-500" },
//       { teamId: "T011", teamName: "Team K", color: "bg-amber-500" },
//       { teamId: "T012", teamName: "Team L", color: "bg-lime-500" },
//       { teamId: "T013", teamName: "Team M", color: "bg-emerald-500" },
//       { teamId: "T014", teamName: "Team N", color: "bg-rose-500" },
//       { teamId: "T015", teamName: "Team O", color: "bg-violet-500" }
//     ];

//     await Team.insertMany(sampleTeams);

//     res.status(201).json({ message: "Teams created successfully!" });
//   } catch (error) {
//     console.error("Error creating teams:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


module.exports = router;