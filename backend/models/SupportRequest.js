import mongoose from 'mongoose';

const SupportRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, if logged in
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }, // pending, replied, closed, etc.
});

const SupportRequest = mongoose.model('SupportRequest', SupportRequestSchema);

export default SupportRequest;
