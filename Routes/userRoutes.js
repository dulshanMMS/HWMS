const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require("../Models/User");

const userController = require("../Controllers/userController");
const user = require('../Models/User');

router.get("/viewUsers",userController.viewUsers);

router.get("/viewUser/:id",userController.viewUser);

router.put("/updateProfile/:id",userController.updateProfile);


  // POST /userlist/addUser
router.post("/addUser",userController.addUser);

  
module.exports  = router;