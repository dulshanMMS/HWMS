const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    role: String,

    nickname: { type: String, default: "" },
    gender: { type: String, default: "" },
    country: { type: String, default: "" },
    timezone: { type: String, default: "" },
    vehicleNo: { type: String, default: "" },

    teamId: { type: String, default: "" } 
});

const db = mongoose.connection.useDb('test');
const user = db.model('user', UserSchema,'users');

module.exports = user;