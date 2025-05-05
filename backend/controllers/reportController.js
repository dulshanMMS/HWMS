// Add this function to your reportController.js
const getDeskUsageStats = async (startDate, endDate) => {
    try {
      // Aggregate desk bookings by floor
      const deskUsage = await Booking.aggregate([
        {
          $match: {
            bookingType: 'seat',
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: '$floor',
            totalBookings: { $sum: 1 }
          }
        }
      ]);
  
      // Define total desks per floor (you should adjust these numbers according to your actual floor capacity)
      const totalDesksPerFloor = {
        1: 100, // Example: Floor 1 has 100 desks
        2: 100,
        3: 100,
        4: 100
      };
  
      // Calculate usage percentages
      const usageStats = Object.entries(totalDesksPerFloor).map(([floor, totalDesks]) => {
        const floorData = deskUsage.find(d => d._id === parseInt(floor)) || { totalBookings: 0 };
        const used = (floorData.totalBookings / totalDesks) * 100;
        return {
          floor: `Floor ${floor}`,
          used: parseFloat(used.toFixed(2)),
          unused: parseFloat((100 - used).toFixed(2))
        };
      });
  
      return usageStats;
    } catch (error) {
      console.error('Error calculating desk usage stats:', error);
      throw error;
    }
  };