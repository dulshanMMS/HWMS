import express from "express";
import verifyToken, { isAdmin } from "../middleware/authMiddleware.js";
import { forgotPassword, resetPassword } from "../controllers/authController.js";
import {
  signup,
  signin,
  protectedRoute,
  userDashboard,
  adminDashboard,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/protected", verifyToken, protectedRoute);  //verifyToken middleware verifies the JWT token sent by the client
router.get("/user", verifyToken, userDashboard);
router.get("/admin", verifyToken, isAdmin, adminDashboard);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
