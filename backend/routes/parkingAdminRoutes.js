// routes/ParkingAdminRoutes.js
import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";

const router = express.Router();

// 1. Filter by Date
router.post("/filter-by-date", async (req, res) => {
  const { date } = req.body;

  if (!date) return res.status(400).json({ message: "Date is required" });

  try {
    const slots = await ParkingSlot.find({
      bookings: { $elemMatch: { date } }
    });

    const results = [];

    slots.forEach(slot => {
      slot.bookings.forEach(booking => {
        if (booking.date === date) {
          results.push({
            slotNumber: slot.slotNumber,
            userName: booking.userName
          });
        }
      });
    });

    res.json({
      totalBookings: results.length,
      bookings: results
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

// 2. Filter by Username
router.post("/filter-by-username", async (req, res) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ message: "Username is required" });

  try {
    const slots = await ParkingSlot.find({
      bookings: { $elemMatch: { userName: username } }
    });

    const bookingDates = [];

    slots.forEach(slot => {
      slot.bookings.forEach(booking => {
        if (booking.userName === username) {
          bookingDates.push(booking.date);
        }
      });
    });

    res.json({
      totalBookings: bookingDates.length,
      bookingDates
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

// 3. Filter by Date + Username
router.post("/filter-by-user-and-date", async (req, res) => {
  const { username, date } = req.body;

  if (!username || !date) {
    return res.status(400).json({ message: "Username and Date are required" });
  }

  try {
    const slots = await ParkingSlot.find({
      bookings: { $elemMatch: { userName: username, date } }
    });

    const results = [];

    slots.forEach(slot => {
      slot.bookings.forEach(booking => {
        if (booking.userName === username && booking.date === date) {
          results.push({
            floor: slot.floor,
            slotNumber: slot.slotNumber,
            entryTime: booking.entryTime,
            exitTime: booking.exitTime
          });
        }
      });
    });

    res.json({ bookings: results });
  } catch (err) {
    res.status(500).json({ error: "Error fetching data" });
  }
});



  
export default router;
