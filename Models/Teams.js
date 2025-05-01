const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  teamId: String,
  teamName: String,
  color: String
});

const db = mongoose.connection.useDb('test');
const team = db.model('team', TeamSchema, 'teams'); // collection name = teams

module.exports = team;