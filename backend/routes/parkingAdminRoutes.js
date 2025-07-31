// routes/ParkingAdminRoutes.js
import express from "express";
import ParkingSlot from "../models/ParkingSlots.js";
import User from '../models/User.js';

const router = express.Router();

// NEW: Get all usernames with first names for admin reference
router.get("/get-usernames", async (req, res) => {
  try {
    // Fetch all users with only firstName and username fields
    const users = await User.find(
      { role: "user" }, // Only get regular users, not admins
      { firstName: 1, username: 1, _id: 0 } // Only return firstName and username
    ).sort({ firstName: 1 }); // Sort by firstName alphabetically

    const userList = users.map(user => ({
      displayName: `${user.firstName} - ${user.username}`,
      firstName: user.firstName,
      username: user.username
    }));

    res.json({
      totalUsers: userList.length,
      users: userList
    });
  } catch (err) {
    console.error("Error fetching usernames:", err);
    res.status(500).json({ error: "Error fetching usernames" });
  }
});

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

// 2. Filter by Username - UPDATED with pagination support and keeping duplicate dates
router.post("/filter-by-username", async (req, res) => {
  const { username, page = 1, limit = 50 } = req.body; // Added pagination parameters

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

    // UPDATED: Keep duplicates but sort by date (newest first)
    // Do NOT remove duplicates - each duplicate represents a separate booking
    const sortedDates = bookingDates.sort((a, b) => new Date(b) - new Date(a));

    // Apply pagination to the full list (including duplicates)
    const totalDates = sortedDates.length;
    const totalPages = Math.ceil(totalDates / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDates = sortedDates.slice(startIndex, endIndex);

    res.json({
      totalBookings: totalDates, // Now represents total bookings (including multiple per day)
      bookingDates: paginatedDates,
      // NEW: Pagination metadata
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalDates,
        itemsPerPage: parseInt(limit),
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
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

// Admin: Add a new slot to a floor
router.post("/add-slot", async (req, res) => {
    const { slotNumber, floor } = req.body;
  
    if (!slotNumber || !floor) {
      return res.status(400).json({ message: "slotNumber and floor are required" });
    }
  
    try {
      const exists = await ParkingSlot.findOne({ slotNumber });
      if (exists) {
        return res.status(400).json({ message: "Slot already exists!" });
      }
  
      const newSlot = new ParkingSlot({
        slotNumber,
        floor,
        bookings: []
      });
  
      await newSlot.save();

      res.status(201).json({ message: "Slot added successfully", slot: newSlot });
    } catch (error) {
      console.error("Error adding slot:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  
  // Admin: Delete a slot 
router.post("/delete-slot", async (req, res) => {
    const { slotNumber } = req.body;
  
    if (!slotNumber) {
      return res.status(400).json({ message: "slotNumber is required" });
    }
  
    try {
      const deleted = await ParkingSlot.findOneAndDelete({ slotNumber });
  
      if (!deleted) {
        return res.status(404).json({ message: "Slot not found" });
      }
  
      res.json({ message: `Slot ${slotNumber} deleted successfully` });
    } catch (error) {
      console.error("Error deleting slot:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
export default router;