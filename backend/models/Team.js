import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  teamName: { type: String, required: true },
  color: { type: String, required: true }
});

export default mongoose.model('Team', teamSchema);