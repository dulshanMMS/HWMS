// controllers/adminBookingController.js
import SeatingSlots from "../models/SeatingSlots.js";
import User from "../models/User.js";
import Team from "../models/Team.js";

// Admin booking controller
export const bookSeatForAdmin = async (req, res) => {
  try {
    console.log("👑 === ADMIN BOOKING START ===");
    const { userName, seatId } = req.params; // userName is the admin's username
    const bookingData = req.body;
    
    console.log(`👑 Admin ${userName} making booking for seat: ${seatId}`);
    
    // Find admin user info
    const adminUser = await User.findOne({ username: userName });
    if (!adminUser) {
      throw new Error(`Admin user ${userName} not found`);
    }
    
    const adminTeam = await Team.findOne({ teamId: adminUser.teamId });
    if (!adminTeam) {
      throw new Error(`Admin team ${adminUser.teamId} not found`);
    }
    
    // Check if admin's record exists
    let adminRecord = await SeatingSlots.findOne({ 
      userName: userName,  // Admin's own userName (dulshan_m)
      status: 'active' 
    });
    
    if (!adminRecord) {
      console.log(`📝 Creating record for admin: ${userName}`);
      adminRecord = new SeatingSlots({
        userName: userName,        // Admin's userName (dulshan_m)
        teamId: adminUser.teamId,  // Admin's teamId
        teamName: adminTeam.teamName, // Admin's teamName
        teamColor: adminTeam.color,    // Admin's teamColor
        bookings: [],
        totalBookings: 0,
        status: 'active'
      });
    }
    
    // Add booking under admin's name
    const bookingId = `${userName}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    adminRecord.bookings.push({
      bookingId,
      areaId: bookingData.roomId,
      floor: bookingData.floor,
      date: new Date(bookingData.date),
      entryTime: bookingData.entryTime,
      exitTime: bookingData.exitTime,
      seatId: seatId,
      bookedAt: new Date(),
      bookedBy: 'admin'
    });
    
    adminRecord.totalBookings = adminRecord.bookings.length;
    await adminRecord.save();
    
    console.log(`✅ Booking created under admin's name: ${userName}, bookingId: ${bookingId}`);
    
    res.json({
      success: true,
      message: 'Admin booking created successfully',
      bookingId: bookingId,
      seatId: seatId,
      userName: userName,  // Admin's userName
      adminBooking: true
    });
    
  } catch (error) {
    console.error("❌ Admin booking error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Admin unbooking controller
export const unbookSeatForAdmin = async (req, res) => {
  try {
    console.log("👑 === ADMIN UNBOOKING START ===");
    const { roomId, seatId, floor, date } = req.params;
    
    // Find booking in regular user records (since admin saves as regular userName)
    const userRecords = await SeatingSlots.find({ 
      'bookings.seatId': seatId,
      'bookings.floor': Number(floor),
      status: 'active'
    });
    
    let bookingFound = false;
    for (const record of userRecords) {
      const bookingIndex = record.bookings.findIndex(booking => 
        booking.seatId === seatId && 
        booking.floor === Number(floor) &&
        booking.date.toISOString().split('T')[0] === date
      );
      
      if (bookingIndex !== -1) {
        const booking = record.bookings[bookingIndex];
        record.bookings.splice(bookingIndex, 1);
        record.totalBookings = record.bookings.length;
        await record.save();
        bookingFound = true;
        console.log(`✅ Booking removed: ${seatId} (booked by: ${booking.bookedBy || 'user'})`);
        break;
      }
    }
    
    if (!bookingFound) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Booking removed successfully',
      seatId: seatId
    });
    
  } catch (error) {
    console.error("❌ Admin unbooking error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Database fix controller
export const fixDatabaseSchema = async (req, res) => {
  try {
    console.log("🔧 PROPER FIX: Making userName unique (not userName+teamId)...");
    
    const indexesToDrop = [
      "memberName_1_teamId_1",
      "username_1_teamId_1", 
      "userName_1_teamId_1",
      "userName_1_teamId_1_clean"
    ];
    
    let droppedIndexes = 0;
    for (const indexName of indexesToDrop) {
      try {
        await SeatingSlots.collection.dropIndex(indexName);
        console.log(`✅ Dropped problematic index: ${indexName}`);
        droppedIndexes++;
      } catch (error) {
        console.log(`ℹ️ Index ${indexName} didn't exist`);
      }
    }
    
    const cleanupResult = await SeatingSlots.deleteMany({
      $or: [
        { userName: null },
        { userName: { $exists: false } },
        { userName: "" }
      ]
    });
    console.log(`🗑️ Deleted ${cleanupResult.deletedCount} records with invalid userName`);
    
    const duplicates = await SeatingSlots.aggregate([
      { $group: { _id: "$userName", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    for (const dup of duplicates) {
      const records = await SeatingSlots.find({ userName: dup._id }).sort({ _id: 1 });
      for (let i = 1; i < records.length; i++) {
        await SeatingSlots.deleteOne({ _id: records[i]._id });
        console.log(`🗑️ Removed duplicate record for ${dup._id}`);
      }
    }
    
    try {
      await SeatingSlots.collection.createIndex(
        { userName: 1 },
        { 
          unique: true, 
          name: "userName_unique",
          partialFilterExpression: { 
            userName: { $exists: true, $ne: null, $ne: "" }
          }
        }
      );
      console.log("✅ Created simple userName-only unique index");
    } catch (error) {
      console.log("⚠️ Index creation error:", error.message);
    }
    
    const totalRecords = await SeatingSlots.countDocuments();
    const indexes = await SeatingSlots.collection.indexes();
    const teamCounts = await SeatingSlots.aggregate([
      { $group: { _id: "$teamId", count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      message: "✅ Fixed! Now multiple users can exist in same team",
      stats: {
        droppedIndexes,
        deletedInvalidRecords: cleanupResult.deletedCount,
        fixedDuplicates: duplicates.length,
        totalRecords,
        teamDistribution: teamCounts,
        newIndexes: indexes.map(idx => idx.name)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Proper fix failed:", error);
    res.status(500).json({ 
      error: error.message,
      message: "Proper fix failed - check server logs"
    });
  }
};

// Get today's total booking count
export const getTodayBookingCount = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const bookings = await SeatingSlots.find({
      'bookings.date': {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const totalBookings = bookings.reduce((sum, slot) => 
      sum + slot.bookings.filter(booking => 
        booking.date.toISOString().split('T')[0] === today
      ).length, 0
    );
    
    res.json({ count: totalBookings });
  } catch (error) {
    console.error('Error fetching today\'s booking count:', error);
    res.status(500).json({ error: 'Failed to fetch booking count' });
  }
};

// Get booking count by team for today
export const getTeamBookingCount = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const bookings = await SeatingSlots.find({
      'bookings.date': {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const teamCounts = {};
    bookings.forEach(slot => {
      slot.bookings.forEach(booking => {
        if (booking.date.toISOString().split('T')[0] === today) {
          const teamName = slot.teamName || 'Unknown';
          teamCounts[teamName] = (teamCounts[teamName] || 0) + 1;
        }
      });
    });
    
    res.json(teamCounts);
  } catch (error) {
    console.error('Error fetching team booking counts:', error);
    res.status(500).json({ error: 'Failed to fetch team booking counts' });
  }
};

// Get booking count by floor
export const getFloorBookingCount = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const bookings = await SeatingSlots.find({
      'bookings.date': {
        $gte: new Date(targetDate),
        $lt: new Date(new Date(targetDate).getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    const floorCounts = {};
    bookings.forEach(slot => {
      slot.bookings.forEach(booking => {
        if (booking.date.toISOString().split('T')[0] === targetDate) {
          const floor = booking.floor || 'Unknown';
          floorCounts[floor] = (floorCounts[floor] || 0) + 1;
        }
      });
    });
    
    res.json(floorCounts);
  } catch (error) {
    console.error('Error fetching floor booking counts:', error);
    res.status(500).json({ error: 'Failed to fetch floor booking counts' });
  }
};