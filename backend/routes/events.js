import express from "express";
import {
  addEvent,
  getAllEvents,
  getEventsByDate,
  deleteEvent,
} from "../controllers/eventController.js";

const router = express.Router();

router.post("/", addEvent);
router.get("/", getAllEvents);
router.get("/:date", getEventsByDate);
router.delete("/:id", deleteEvent);

export default router;
