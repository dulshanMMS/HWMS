import express from "express";
import * as userController from "../Controllers/userController.js";

const router = express.Router();

router.get("/viewUsers", userController.viewUsers);
router.get("/viewUser/:id", userController.viewUser);
router.put("/updateProfile/:id", userController.updateProfile);
router.post("/addUser", userController.addUser);

export default router;
