const express = require('express');
const router = express.Router();

router.get("/",(req,res)=>{
    res.send("welcome");
});

router.get("/hello",(req,res)=>{
    res.send("Hello user");
});

module.exports = router;