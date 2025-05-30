import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    //Extended profile fields DM
    nickName: { type: String },
    gender: { type: String },
    country: { type: String },
    language: { type: String },
    timeZone: { type: String },
    teamId: { type: String, default: "" },
    vehicleNumber: { type: String },


    role: { type: String, enum: ["admin", "user"], default: "user" },
    notificationPreferences: {
        email: {
            seat_booking: {
                type: Boolean,
                default: true
            },
            parking_booking: {
                type: Boolean,
                default: true
            },
            important: {
                type: Boolean,
                default: true
            },
            general: {
                type: Boolean,
                default: false
            }
        },
        inApp: {
            seat_booking: {
                type: Boolean,
                default: true
            },
            parking_booking: {
                type: Boolean,
                default: true
            },
            important: {
                type: Boolean,
                default: true
            },
            general: {
                type: Boolean,
                default: true
            }
        }
    }
});

export default mongoose.model("User", UserSchema);