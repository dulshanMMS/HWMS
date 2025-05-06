import mongoose from "mongoose";

const URI = "mongodb+srv://hwmsbooking:f0yWeabr2yB7sfyJ@cluster0.otoqe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to the cluster");
});

export default db;
