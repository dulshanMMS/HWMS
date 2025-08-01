import express from "express";
import SeatingSlots from "../models/SeatingSlots.js";
import User from "../models/User.js";
import verifyToken from "../middleware/authMiddleware.js";
import { createCancellationNotifications } from "../services/notificationService.js";

const router = express.Router();

// Helper function to get username from req.user
const getUserName = async (reqUser) => {
    console.log('🔍 req.user object:', JSON.stringify(reqUser, null, 2));
    
    // Try different possible field names
    let userName = reqUser.userName || reqUser.username || reqUser.name;
    
    if (userName) {
        console.log('✅ Found userName directly:', userName);
        return userName;
    }
    
    // If no username found, fetch from database using ID
    if (reqUser.id) {
        console.log('🔍 No userName found, fetching from database with ID:', reqUser.id);
        try {
            const user = await User.findById(reqUser.id);
            if (user) {
                userName = user.username || user.userName || user.name;
                console.log('✅ Found userName from database:', userName);
                return userName;
            }
        } catch (error) {
            console.error('❌ Error fetching user from database:', error);
        }
    }
    
    console.log('❌ Could not determine userName');
    return null;
};

// Get Seat Booking History (Total bookings + Dates) - Auth Required
router.post("/user", verifyToken, async (req, res) => {
    const { type } = req.body;
    
    try {
        const userName = await getUserName(req.user);
        console.log('📝 POST /user - userName:', userName);
        
        if (!userName) {
            return res.status(400).json({ message: "Could not determine user identity" });
        }

        // Find the user's booking record
        const userBookings = await SeatingSlots.findOne({ userName: userName });

        if (!userBookings) {
            console.log('❌ No bookings found for user:', userName);
            return res.json({
                totalBookings: 0,
                bookedDates: []
            });
        }

        const totalBookings = userBookings.totalBookings;
        const bookedDates = new Set();

        // Extract unique dates from bookings array
        userBookings.bookings.forEach(booking => {
            // Convert date to string format for consistency
            const dateStr = booking.date.toISOString().split('T')[0]; // YYYY-MM-DD format
            bookedDates.add(dateStr);
        });

        console.log(`✅ Found ${totalBookings} total bookings, ${bookedDates.size} unique dates for user:`, userName);

        return res.json({
            totalBookings,
            bookedDates: Array.from(bookedDates) // Convert Set to Array
        });

    } catch (error) {
        console.error('❌ Error in POST /user:', error);
        return res.status(500).json({ message: "Error fetching seat booking history", error });
    }
});

// Get Seat Booking Details for a Specific Date - Auth Required
router.post("/user/details", verifyToken, async (req, res) => {
    const { type, date } = req.body;

    try {
        const userName = await getUserName(req.user);
        console.log('📝 POST /user/details - userName:', userName, 'date:', date);
        
        if (!userName) {
            return res.status(400).json({ message: "Could not determine user identity" });
        }

        // Find the user's booking record
        const userBookings = await SeatingSlots.findOne({ userName: userName });

        if (!userBookings) {
            return res.status(404).json({ message: "No booking records found for user." });
        }

        // Filter bookings for the specific date
        const targetDate = new Date(date);
        const bookingDetails = userBookings.bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return bookingDate.toDateString() === targetDate.toDateString();
        }).map(booking => ({
            bookingId: booking.bookingId,
            areaId: booking.areaId,
            floor: booking.floor,
            date: booking.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
            entryTime: booking.entryTime,
            exitTime: booking.exitTime,
            seatId: booking.seatId,
            bookedAt: booking.bookedAt,
            teamName: userBookings.teamName,
            teamColor: userBookings.teamColor
        }));

        console.log(`✅ Found ${bookingDetails.length} bookings for date ${date}, user:`, userName);

        if (bookingDetails.length === 0) {
            return res.status(404).json({ message: "No seat bookings found for the selected date." });
        }

        return res.json(bookingDetails);

    } catch (error) {
        console.error('❌ Error in POST /user/details:', error);
        return res.status(500).json({ message: "Error fetching seat booking details", error });
    }
});

// Delete Seat Booking - Auth Required
router.delete("/user/delete", verifyToken, async (req, res) => {
    const { bookingId, seatId, date, entryTime, exitTime } = req.body;

    try {
        const userName = await getUserName(req.user);
        console.log('🗑️ DELETE /user/delete - userName:', userName, 'bookingId:', bookingId, 'seatId:', seatId, 'date:', date);
        
        if (!userName) {
            return res.status(400).json({ message: "Could not determine user identity" });
        }

        // Find the user's booking record
        const userBookings = await SeatingSlots.findOne({ userName: userName });

        if (!userBookings) {
            return res.status(404).json({ message: "No booking records found for user." });
        }

        // Find the booking to be removed to capture its details
        const bookingToRemove = userBookings.bookings.find(booking => {
            if (bookingId) {
                return booking.bookingId === bookingId;
            } else {
                const bookingDate = booking.date.toISOString().split('T')[0];
                return (
                    booking.seatId === seatId &&
                    bookingDate === date &&
                    booking.entryTime === entryTime &&
                    booking.exitTime === exitTime
                );
            }
        });

        if (!bookingToRemove) {
            return res.status(404).json({ message: "Seat booking not found for deletion." });
        }

        // Remove the specific booking
        const initialLength = userBookings.bookings.length;
        userBookings.bookings = userBookings.bookings.filter(booking => {
            if (bookingId) {
                return booking.bookingId !== bookingId;
            } else {
                const bookingDate = booking.date.toISOString().split('T')[0];
                return !(
                    booking.seatId === seatId &&
                    bookingDate === date &&
                    booking.entryTime === entryTime &&
                    booking.exitTime === exitTime
                );
            }
        });

        // Check if any booking was actually removed
        if (userBookings.bookings.length === initialLength) {
            return res.status(404).json({ message: "Seat booking not found for deletion." });
        }

        // Update totalBookings count
        userBookings.totalBookings = userBookings.bookings.length;

        // Save the updated document
        await userBookings.save();

        // Create cancellation notification Sjay
        try {
            const user = await User.findOne({ username: userName }).select('_id');
            if (!user) {
                console.error(`❌ User not found for username: ${userName}`);
            } else {
                const targetDate = bookingToRemove.date.toISOString().split('T')[0];
                 createCancellationNotifications({
                    userId: user._id.toString(),
                    slotNumber: bookingToRemove.seatId,
                    floor: bookingToRemove.floor,
                    type: 'seat',
                    date: targetDate,
                    bookingId: bookingToRemove.bookingId
                });
                console.log(`✅ Cancellation notification created for booking: ${bookingToRemove.bookingId}`);
            }
        } catch (notificationError) {
            console.error(`❌ Failed to create cancellation notification:`, notificationError);
            // Don't throw error to avoid disrupting booking deletion
        }

        console.log("✅ Booking deleted successfully for user:", userName);
        return res.json({ message: "Seat booking deleted successfully." });

    } catch (error) {
        console.error('❌ Error in DELETE /user/delete:', error);
        return res.status(500).json({ message: "Error deleting seat booking", error });
    }
});

// Get user's team information - Auth Required
router.get("/user/team", verifyToken, async (req, res) => {
    try {
        const userName = await getUserName(req.user);
        console.log('👥 GET /user/team - userName:', userName);
        
        if (!userName) {
            return res.status(400).json({ message: "Could not determine user identity" });
        }

        // Find user's team information
        const userBookings = await SeatingSlots.findOne(
            { userName: userName }, 
            { teamName: 1, teamColor: 1, teamId: 1, totalBookings: 1 }
        );

        if (!userBookings) {
            console.log("❌ User team information not found for:", userName);
            return res.status(404).json({ message: "User team information not found." });
        }

        console.log("✅ Team info found for user:", userName, {
            teamName: userBookings.teamName,
            teamColor: userBookings.teamColor,
            teamId: userBookings.teamId
        });

        return res.json({
            teamName: userBookings.teamName,
            teamColor: userBookings.teamColor,
            teamId: userBookings.teamId,
            totalBookings: userBookings.totalBookings
        });

    } catch (error) {
        console.error('❌ Error in GET /user/team:', error);
        return res.status(500).json({ message: "Error fetching team information", error });
    }
});

export default router;