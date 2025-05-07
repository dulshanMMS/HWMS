import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  date: String,
  title: String,
  description: String,
  time: String,
});

const Event = mongoose.model("Event", eventSchema);
export default Event;