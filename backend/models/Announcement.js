import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

<<<<<<< HEAD
export default mongoose.model("Announcement", announcementSchema);
=======
export default mongoose.model("Announcement", announcementSchema);
>>>>>>> origin/dev2
