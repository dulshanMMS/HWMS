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
        bookingConfirmation: {
            email: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        cancellationAlert: {
            email: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        adminAnnouncements: {
            email: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        bookingReminder: {
            email: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true } // Mandatory in-app
        }
    }
});

export default mongoose.model("User", UserSchema);

