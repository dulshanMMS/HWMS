const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    role: String
});

const db = mongoose.connection.useDb('test');
const user = db.model('user', UserSchema,'users');

module.exports = user;