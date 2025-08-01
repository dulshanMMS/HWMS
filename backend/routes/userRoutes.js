import express from "express";
import { body, validationResult } from "express-validator";
import {
  getUserProfile,
  updateUserProfile,
  getUsers,
} from "../controllers/userController.js";
import verifyToken from "../middleware/authMiddleware.js"; // Auth middleware to verify JWT
import { getAllUsers, updateUserRole } from "../controllers/userController.js";
import { authenticateUser, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to get the profile info of the logged-in user
// Protected route: requires valid JWT token
router.get("/profile", verifyToken, getUserProfile);
router.get("/", getUsers); // for teamId-based query in AdminTeamManagement ------------- Maleeha         
router.get("/users", authenticateUser, verifyAdmin, getAllUsers);  //to switch a user into an admin ------Maleesha
router.patch("/users/:id/role", authenticateUser, verifyAdmin, updateUserRole);

// Route to update the logged-in user's profile info
// Protected route with input validation on specific fields
router.put(
  "/profile",
  verifyToken,  // Ensure the user is authenticated
  // Optional validation: fields can be omitted but if present, must be valid
  body("firstName").optional().isString().withMessage("First name must be a string"),
  body("lastName").optional().isString().withMessage("Last name must be a string"),
  body("email").optional().isEmail().withMessage("Invalid email format"),

  // Middleware to check validation result and return errors if any
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation errors exist, respond with 400 Bad Request and error details
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },

  // If validation passes, call controller to update profile
  updateUserProfile
);

export default router;
