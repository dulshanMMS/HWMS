import express from "express";
import verifyToken, { isAdmin } from "../middleware/authMiddleware.js";
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
router.get("/protected", verifyToken, protectedRoute);
router.get("/user", verifyToken, userDashboard);
router.get("/admin", verifyToken, isAdmin, adminDashboard);

export default router;
