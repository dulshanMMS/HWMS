import express from "express";
import User from "../models/User.js";
import Booking from "../models/Booking.js"; // Assuming you have a Booking model
import verifyToken, { isAdmin } from "../middleware/authMiddleware.js";

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

export default router;