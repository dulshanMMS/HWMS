const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Import Routes
const seatBookingRoutes = require('./routes/seatBookings');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', seatBookingRoutes);

const PORT = 8000;
const DB_URL = 'mongodb+srv://user01:Matamathakanaa1128@cluster001.yt3tg.mongodb.net/myDatabase?retryWrites=true&w=majority&appName=Cluster001';

mongoose.connect(DB_URL)
    .then(() => console.log('DB Connected'))
    .catch((err) => console.log('DB connection error:', err));

app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});
