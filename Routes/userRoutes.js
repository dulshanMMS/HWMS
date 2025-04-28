const express = require('express');
const router = express.Router();

const User = require("../Models/User");

router.get("/viewUsers",async (req,res)=>{
    const result = await User.find();
    if(result){
        res.send({
            "Message":`${result.length} Users found`,
            "Users list":result
        }).status(200);
    }else{
        res.send({
            "Message":"No users found"
        }).status(404);
    }
});

router.get("/viewUser/:id",async (req,res)=>{
    const id = req.params.id;
    const result = await User.find({_id:id});
    if(result){
        res.send({
            "Message":`User found`,
            "User":result
        }).status(200);
    }else{
        res.send({
            "Message":"User not found"
        }).status(404);
    }
})

module.exports  = router;