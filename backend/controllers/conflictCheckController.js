// controllers/conflictCheckController.js
import SeatingSlots from "../models/SeatingSlots.js";
import { checkTimeOverlap, parseDateSafely } from "../services/seatValidationService.js";

export const checkUserBookingConflict = async (req, res) => {
  try {
    const { userName, date, entryTime, exitTime } = req.body;

    console.log(`🔍 Checking conflict for user: ${userName}, date: ${date}, time: ${entryTime}-${exitTime}`);

    // Parse the booking date safely
    const { startOfDay, endOfDay } = parseDateSafely(date);

    // Find user's document in the seatingslots collection
    const userDocument = await SeatingSlots.findOne({ 
      userName: userName,
      status: 'active'
    });

    if (!userDocument || !userDocument.bookings || userDocument.bookings.length === 0) {
      console.log(`✅ No existing bookings found for user: ${userName}`);
      return res.json({
        hasConflict: false,
        message: 'No conflicts found'
      });
    }

    console.log(`📋 Found ${userDocument.bookings.length} existing bookings for user: ${userName}`);

    // Check each booking for time conflicts on the same date
    for (const booking of userDocument.bookings) {
      const bookingDate = new Date(booking.date);
      
      // Check if booking is on the same date
      if (bookingDate >= startOfDay && bookingDate <= endOfDay) {
        console.log(`📅 Checking booking on same date: Floor ${booking.floor}, Time: ${booking.entryTime}-${booking.exitTime}`);
        
        // Check for time overlap using your existing utility function
        if (checkTimeOverlap(entryTime, exitTime, booking.entryTime, booking.exitTime)) {
          console.log(`⚠️ TIME CONFLICT FOUND!`);
          console.log(`   Requested: ${entryTime}-${exitTime}`);
          console.log(`   Existing:  ${booking.entryTime}-${booking.exitTime}`);
          console.log(`   Floor:     ${booking.floor}`);
          
          return res.json({
            hasConflict: true,
            existingFloor: booking.floor,
            bookingId: booking.bookingId,
            existingTime: `${booking.entryTime}-${booking.exitTime}`,
            existingSeat: booking.seatId,
            message: `You have an existing booking on Floor ${booking.floor} from ${booking.entryTime} to ${booking.exitTime}`
          });
        } else {
          console.log(`✅ No time overlap with booking: ${booking.entryTime}-${booking.exitTime}`);
        }
      } else {
        console.log(`📅 Booking on different date: ${bookingDate.toDateString()} vs ${startOfDay.toDateString()}`);
      }
    }

    console.log(`✅ No conflicts found for user: ${userName}`);
    return res.json({
      hasConflict: false,
      message: 'No conflicts found'
    });

  } catch (error) {
    console.error('❌ Error checking user booking conflict:', error);
    return res.status(500).json({
      error: 'Internal server error while checking booking conflicts',
      message: error.message
    });
  }
};