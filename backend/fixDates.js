import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Check if MONGO_URI exists (changed from MONGODB_URI to MONGO_URI)
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in .env file');
    process.exit(1);
}

console.log('Attempting to connect to MongoDB...');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        try {
            // Get all bookings
            const bookings = await Booking.find({});
            console.log(`Found ${bookings.length} bookings`);
            
            // Update each booking
            for (const booking of bookings) {
                if (!(booking.date instanceof Date)) {
                    booking.date = new Date(booking.date);
                }
                if (!(booking.createdAt instanceof Date)) {
                    booking.createdAt = new Date(booking.createdAt);
                }
                await booking.save();
            }
            
            console.log('Successfully updated all bookings');
        } catch (error) {
            console.error('Error updating dates:', error);
        } finally {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });