import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  memberId: {
    type: String,
    required: true, // Unique identifier for each member
  },
  role: {
    type: String,
    enum: ['leader', 'member'], // Roles can be "leader" or "member"
    required: true,
  },
});

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true, // Ensures each team has a unique name
  },
  teamColor: {
    type: String,
    required: true, // Store team color (e.g., "#FF5733")
  },
  members: [teamMemberSchema], // Array of team members
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
