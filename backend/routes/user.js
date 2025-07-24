import express from "express";
import User from "../models/User.js";
import verifyToken, { isAdmin } from "../middleware/authMiddleware.js";

//import profile controller functions DM
import {
    getUserProfile,
    updateUserProfile,
  } from "../controllers/userController.js";

const router = express.Router();

// Admin: Lookup user info and booking counts
router.get("/lookup", verifyToken, isAdmin, async (req, res) => {
    const { userId, username } = req.query;
    if (!userId && !username) {
        return res.status(400).json({ error: "userId or username required" });
    }

    try {
        const user = await User.findOne(
            userId ? { _id: userId } : { username }
        ).select("username firstName lastName team");
        if (!user) return res.status(404).json({ error: "User not found" });

        // Count bookings by type
        const bookings = await Booking.find({ userId: user._id });
        const parkingCount = bookings.filter(b => b.type === "parking").length;
        const seatCount = bookings.filter(b => b.type === "seat").length;

        res.json({
            user: {
                id: user._id,
                username: user.username,
                name: `${user.firstName} ${user.lastName}`,
                team: user.team,
            },
            parkingCount,
            seatCount,
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);


//Maleesha
// GET /api/user?teamId=T001 - Fetch users by teamId
router.get("/", async (req, res) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: "teamId is required" });

    const users = await User.find({ teamId }).select("username firstName lastName");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users by teamId:", error);
    res.status(500).json({ error: "Server error while fetching users" });
  }
});


export default router;