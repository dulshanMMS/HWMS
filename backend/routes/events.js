// import express from "express";
// import {
//   addEvent,
//   getAllEvents,
//   getEventsByDate,
//   deleteEvent,
// } from "../controllers/eventController.js";

// const router = express.Router();

// router.post("/", addEvent);
// router.get("/", getAllEvents);
// router.get("/:date", getEventsByDate);
// router.delete("/:id", deleteEvent);

// export default router;

import express from "express";
import {
  addEvent,
  getAllEvents,
  getEventsByDate,
  deleteEvent,
} from "../controllers/eventController.js";
import { authenticateUser, verifyAdmin } from "../middleware/authMiddleware.js"; // Adjust path to your auth middleware file

const router = express.Router();

router.post("/", authenticateUser, verifyAdmin, addEvent);
router.get("/", authenticateUser, getAllEvents);
router.get("/:date", authenticateUser, getEventsByDate);
router.delete("/:id", authenticateUser, verifyAdmin, deleteEvent);

export default router;
