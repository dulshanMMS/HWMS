const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const User = require('../models/User');

const MONGODB_URI = 'mongodb+srv://HWMS:HWMS#123@hwms.42isa.mongodb.net/?retryWrites=true&w=majority&appName=HWMS';

// Sample data generation
const generateSampleData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a sample user if not exists
    let user = await User.findOne({ email: 'admin@wiley.com' });
    if (!user) {
      user = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@wiley.com',
        password: 'admin123'
      });
    }

    // Generate sample bookings for the last 30 days
    const bookings = [];
    const types = ['seats', 'parking'];
    const statuses = ['confirmed', 'completed', 'cancelled'];
    const prices = { seats: 10, parking: 15 };

    for (let i = 0; i < 100; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const startTime = new Date();
      startTime.setDate(startTime.getDate() - daysAgo);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + Math.floor(Math.random() * 8) + 1);

      bookings.push({
        user: user._id,
        type,
        status,
        price: prices[type],
        startTime,
        endTime,
        createdAt: startTime
      });
    }

    // Clear existing bookings
    await Booking.deleteMany({});

    // Insert new bookings
    await Booking.insertMany(bookings);
    console.log('Sample data inserted successfully');

    // Log some statistics
    const totalBookings = await Booking.countDocuments();
    const seatBookings = await Booking.countDocuments({ type: 'seats' });
    const parkingBookings = await Booking.countDocuments({ type: 'parking' });

    console.log(`Total Bookings: ${totalBookings}`);
    console.log(`Seat Bookings: ${seatBookings}`);
    console.log(`Parking Bookings: ${parkingBookings}`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the seeding function
generateSampleData(); 