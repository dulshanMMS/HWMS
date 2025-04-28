const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParkingSchema = new Schema({
    slotNumber:int,
    floor:int,
    bookings:String
});

const db = mongoose.connection.useDb('test');
const parking = db.model('parkingslots', ParkingSchema);

module.exports = parking;